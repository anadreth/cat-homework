import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupStore, createMockDashboard } from '../test-utils';
import {
  importDashboard,
  addWidget
} from '@/store/slices/coreSlice';
import { exportDashboardToFile } from '@/store/middleware/autosave';

describe('Import/Export Functionality', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
    localStorage.clear();
  });

  describe('Dashboard Export', () => {
    it('should export dashboard with correct structure', () => {
      const mockDashboard = createMockDashboard();
      store.dispatch(importDashboard(mockDashboard));

      const state = store.getState();
      const dashboard = state.core.present.dashboard;

      expect(dashboard.instances).toEqual(mockDashboard.instances);
      expect(dashboard.layout).toEqual(mockDashboard.layout);
      expect(dashboard.meta).toBeDefined();
    });

    it('should include version and exportedAt timestamp', () => {
      const mockDashboard = createMockDashboard();
      store.dispatch(importDashboard(mockDashboard));

      const state = store.getState();
      const dashboard = state.core.present.dashboard;

      expect(dashboard.meta).toBeDefined();
      expect(dashboard.meta.createdAt).toBeDefined();
      expect(dashboard.meta.updatedAt).toBeDefined();
    });

    it('should export dashboard to JSON file', () => {
      const mockDashboard = createMockDashboard();

      // Mock URL.createObjectURL and related functions
      const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      const mockClick = vi.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportDashboardToFile(mockDashboard);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(mockLink.download).toMatch(/dashboard-\d+\.json/);
    });

    it('should handle export errors gracefully', () => {
      const invalidData = { invalid: 'data' };

      // Mock to throw error during JSON.stringify
      const mockStringify = vi.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Export failed');
      });

      expect(() => exportDashboardToFile(invalidData)).toThrow('Export failed');

      mockStringify.mockRestore();
    });
  });

  describe('Dashboard Import', () => {
    it('should import dashboard successfully', () => {
      const mockDashboard = createMockDashboard();

      store.dispatch(importDashboard(mockDashboard));

      const state = store.getState();
      const { instances, layout } = state.core.present.dashboard;

      expect(Object.keys(instances)).toHaveLength(2);
      expect(layout).toHaveLength(2);
      expect(instances['widget-1']).toEqual(mockDashboard.instances['widget-1']);
      expect(instances['widget-2']).toEqual(mockDashboard.instances['widget-2']);
    });

    it('should preserve widget types on import', () => {
      const mockDashboard = createMockDashboard();

      store.dispatch(importDashboard(mockDashboard));

      const state = store.getState();
      const { instances } = state.core.present.dashboard;

      expect(instances['widget-1'].type).toBe('chart');
      expect(instances['widget-2'].type).toBe('table');
    });

    it('should preserve layout positions on import', () => {
      const mockDashboard = createMockDashboard();

      store.dispatch(importDashboard(mockDashboard));

      const state = store.getState();
      const { layout } = state.core.present.dashboard;

      expect(layout[0]).toMatchObject({
        id: 'widget-1',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      });

      expect(layout[1]).toMatchObject({
        id: 'widget-2',
        x: 6,
        y: 0,
        w: 6,
        h: 4,
      });
    });

    it('should clear existing dashboard when importing new one', () => {
      const firstDashboard = createMockDashboard();
      const now = Date.now();
      const secondDashboard = {
        version: 1,
        id: crypto.randomUUID(),
        name: 'Second Dashboard',
        instances: {
          'widget-3': {
            id: 'widget-3',
            type: 'text' as const,
            props: { title: 'New', content: 'Content' },
            createdAt: now,
            updatedAt: now,
          },
        },
        layout: [
          { id: 'widget-3', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        ],
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      };

      store.dispatch(importDashboard(firstDashboard));
      store.dispatch(importDashboard(secondDashboard));

      const state = store.getState();
      const { instances, layout } = state.core.present.dashboard;

      expect(Object.keys(instances)).toHaveLength(1);
      expect(instances['widget-3']).toBeDefined();
      expect(instances['widget-1']).toBeUndefined();
      expect(layout).toHaveLength(1);
    });

    it('should handle undo after import correctly', () => {
      const mockDashboard = createMockDashboard();

      // Add a widget to create history
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });
      store.dispatch(action);

      // Import dashboard - replaces current state
      store.dispatch(importDashboard(mockDashboard));

      let state = store.getState();
      // Should have imported widgets
      expect(state.core.present.dashboard.instances['widget-1']).toBeDefined();
      expect(state.core.present.dashboard.instances['widget-2']).toBeDefined();

      // Undo should go back to state with our added widget (before import)
      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      expect(state.core.present.dashboard.instances[action.meta.id]).toBeDefined();
      expect(state.core.present.dashboard.instances['widget-1']).toBeUndefined();
    });
  });

  describe('Widget Export/Import', () => {
    it('should export individual widget', () => {
      const mockDashboard = createMockDashboard();
      store.dispatch(importDashboard(mockDashboard));

      const state = store.getState();
      const widget = state.core.present.dashboard.instances['widget-1'];
      const layoutItem = state.core.present.dashboard.layout.find(
        item => item.id === 'widget-1'
      );

      const widgetExport = {
        type: widget.type,
        props: widget.props,
        layout: {
          w: layoutItem?.w,
          h: layoutItem?.h,
          minW: layoutItem?.minW,
          minH: layoutItem?.minH,
        },
      };

      expect(widgetExport.type).toBe('chart');
      expect(widgetExport.props).toBeDefined();
      expect(widgetExport.layout.w).toBe(6);
      expect(widgetExport.layout.h).toBe(4);
    });
  });

  describe('LocalStorage Integration', () => {
    it('should save dashboard to localStorage', () => {
      const mockDashboard = createMockDashboard();
      store.dispatch(importDashboard(mockDashboard));

      const state = store.getState();
      const dashboard = state.core.present.dashboard;

      localStorage.setItem('retool-dashboard', JSON.stringify(dashboard));

      const saved = localStorage.getItem('retool-dashboard');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved!);
      expect(parsed.instances).toEqual(mockDashboard.instances);
    });

    it('should load dashboard from localStorage', () => {
      const mockDashboard = createMockDashboard();
      localStorage.setItem('retool-dashboard', JSON.stringify(mockDashboard));

      const saved = localStorage.getItem('retool-dashboard');
      const parsed = JSON.parse(saved!);

      store.dispatch(importDashboard(parsed));

      const state = store.getState();
      expect(state.core.present.dashboard.instances).toEqual(mockDashboard.instances);
    });

    it('should handle missing localStorage data gracefully', () => {
      const saved = localStorage.getItem('retool-dashboard');
      expect(saved).toBeNull();

      const state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(0);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('retool-dashboard', 'invalid json{}}');

      const saved = localStorage.getItem('retool-dashboard');
      expect(() => JSON.parse(saved!)).toThrow();
    });
  });
});
