import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setupStore } from '../test-utils';
import {
  addWidget,
  removeWidget,
  updateWidgetProps,
  importDashboard,
} from '@/store/slices/coreSlice';
import { loadDashboard, clearDashboard } from '@/store/middleware/autosave';

const STORAGE_KEY = 'retool-dashboard';
const DEBOUNCE_MS = 700;

describe('Autosave Functionality', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Auto-save to LocalStorage', () => {
    it('should save dashboard after adding a widget (after debounce)', async () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: { title: 'Test Chart' },
      });

      store.dispatch(action);

      // Before debounce, nothing saved
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      // Fast-forward time past debounce
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      // After debounce, dashboard should be saved
      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.instances[action.meta.id]).toBeDefined();
      expect(parsed.instances[action.meta.id].props.title).toBe('Test Chart');
    });

    it('should debounce multiple rapid changes', async () => {
      const action1 = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      const action2 = addWidget({
        type: 'table',
        layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      const action3 = addWidget({
        type: 'list',
        layout: { x: 0, y: 4, w: 4, h: 3, minW: 2, minH: 2 },
      });

      // Dispatch actions rapidly
      store.dispatch(action1);
      await vi.advanceTimersByTimeAsync(100);

      store.dispatch(action2);
      await vi.advanceTimersByTimeAsync(100);

      store.dispatch(action3);
      await vi.advanceTimersByTimeAsync(100);

      // Still no save (debounce not complete)
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      // Fast-forward remaining time
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      // Now saved with all three widgets
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);

      expect(Object.keys(parsed.instances)).toHaveLength(3);
      expect(parsed.instances[action1.meta.id]).toBeDefined();
      expect(parsed.instances[action2.meta.id]).toBeDefined();
      expect(parsed.instances[action3.meta.id]).toBeDefined();
    });

    it('should save after removing a widget', async () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      store.dispatch(removeWidget(action.meta.id));
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);

      expect(parsed.instances[action.meta.id]).toBeUndefined();
      expect(Object.keys(parsed.instances)).toHaveLength(0);
    });

    it('should save after updating widget props', async () => {
      const action = addWidget({
        type: 'text',
        layout: { x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        props: { content: 'Original' },
      });

      store.dispatch(action);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      store.dispatch(
        updateWidgetProps({
          id: action.meta.id,
          props: { content: 'Updated' },
        })
      );
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);

      expect(parsed.instances[action.meta.id].props.content).toBe('Updated');
    });

    it('should save after undo operation', async () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      // Verify widget saved
      let saved = localStorage.getItem(STORAGE_KEY);
      let parsed = JSON.parse(saved!);
      expect(Object.keys(parsed.instances)).toHaveLength(1);

      // Undo
      store.dispatch({ type: 'UNDO' });
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      // Verify empty dashboard saved
      saved = localStorage.getItem(STORAGE_KEY);
      parsed = JSON.parse(saved!);
      expect(Object.keys(parsed.instances)).toHaveLength(0);
    });

    it('should save after redo operation', async () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      store.dispatch({ type: 'UNDO' });
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      // Redo
      store.dispatch({ type: 'REDO' });
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      expect(parsed.instances[action.meta.id]).toBeDefined();
    });

    it('should cancel previous save when new action arrives during debounce', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      const action1 = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action1);
      await vi.advanceTimersByTimeAsync(300);

      // Another action before debounce completes
      const action2 = addWidget({
        type: 'table',
        layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action2);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      // Should only save once (second action cancels first)
      expect(setItemSpy).toHaveBeenCalledTimes(1);

      // Saved state should include both widgets
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      expect(Object.keys(parsed.instances)).toHaveLength(2);

      setItemSpy.mockRestore();
    });
  });

  describe('Save Status Tracking', () => {
    it('should mark as saving when action is dispatched', async () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      // Check immediately after dispatch
      const state = store.getState();
      expect(state.ui.saveStatus).toBe('saving');
    });

    it('should mark as saved after debounce completes', async () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      const state = store.getState();
      expect(state.ui.saveStatus).toBe('saved');
      expect(state.ui.lastSaved).toBeGreaterThan(0);
    });

    it('should update lastSaved timestamp', async () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const beforeSave = Date.now();
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      const afterSave = Date.now();

      const state = store.getState();
      expect(state.ui.lastSaved).toBeGreaterThanOrEqual(beforeSave);
      expect(state.ui.lastSaved).toBeLessThanOrEqual(afterSave);
    });

    it('should mark as error if save fails', async () => {
      // Mock localStorage.setItem to throw error
      const setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });

      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      const state = store.getState();
      expect(state.ui.saveStatus).toBe('error');

      setItemSpy.mockRestore();
    });
  });

  describe('Loading Dashboard', () => {
    it('should load dashboard from localStorage', () => {
      const mockDashboard = {
        version: 1,
        id: 'test-id',
        name: 'Test Dashboard',
        instances: {
          'widget-1': {
            id: 'widget-1',
            type: 'chart',
            props: { title: 'Chart' },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        layout: [
          { id: 'widget-1', x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        ],
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDashboard));

      const loaded = loadDashboard();

      expect(loaded).not.toBeNull();
      expect(loaded.name).toBe('Test Dashboard');
      expect(loaded.instances['widget-1']).toBeDefined();
    });

    it('should return null when localStorage is empty', () => {
      const loaded = loadDashboard();
      expect(loaded).toBeNull();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json{{{');

      const loaded = loadDashboard();

      expect(loaded).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const getItemSpy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage unavailable');
        });

      const loaded = loadDashboard();

      expect(loaded).toBeNull();

      getItemSpy.mockRestore();
    });
  });

  describe('Clearing Dashboard', () => {
    it('should clear dashboard from localStorage', () => {
      const mockDashboard = {
        instances: {},
        layout: [],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDashboard));

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      clearDashboard();

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should handle clear errors gracefully', () => {
      const removeItemSpy = vi
        .spyOn(Storage.prototype, 'removeItem')
        .mockImplementation(() => {
          throw new Error('Storage unavailable');
        });

      // Should not throw
      expect(() => clearDashboard()).not.toThrow();

      removeItemSpy.mockRestore();
    });
  });

  describe('Dashboard Import Integration', () => {
    it('should save imported dashboard after debounce', async () => {
      const mockDashboard = {
        version: 1,
        id: 'imported-id',
        name: 'Imported Dashboard',
        instances: {
          'widget-1': {
            id: 'widget-1',
            type: 'chart' as const,
            props: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        layout: [
          { id: 'widget-1', x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        ],
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      store.dispatch(importDashboard(mockDashboard));
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);

      expect(parsed.name).toBe('Imported Dashboard');
      expect(parsed.instances['widget-1']).toBeDefined();
    });

    it('should replace existing saved dashboard on import', async () => {
      // Add initial widget
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      // Import new dashboard
      const mockDashboard = {
        version: 1,
        id: 'new-id',
        name: 'New Dashboard',
        instances: {},
        layout: [],
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      store.dispatch(importDashboard(mockDashboard));
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);

      expect(parsed.name).toBe('New Dashboard');
      expect(Object.keys(parsed.instances)).toHaveLength(0);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle many rapid actions without excessive saves', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      // Dispatch 50 rapid actions
      for (let i = 0; i < 50; i++) {
        store.dispatch(
          addWidget({
            type: 'text',
            layout: { x: 0, y: i, w: 2, h: 1, minW: 1, minH: 1 },
          })
        );
        await vi.advanceTimersByTimeAsync(10);
      }

      // Complete debounce
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      // Should only save once due to debouncing
      expect(setItemSpy).toHaveBeenCalledTimes(1);

      // Final save should include all widgets
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      expect(Object.keys(parsed.instances)).toHaveLength(50);

      setItemSpy.mockRestore();
    });

    it('should handle localStorage quota exceeded gracefully', async () => {
      const setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });

      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      // Should not crash
      await expect(
        vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      ).resolves.not.toThrow();

      const state = store.getState();
      expect(state.ui.saveStatus).toBe('error');

      setItemSpy.mockRestore();
    });

    it('should save large dashboards successfully', async () => {
      // Create dashboard with 100 widgets
      for (let i = 0; i < 100; i++) {
        const chartData = Array.from({ length: 10 }, (_, j) => ({
          x: j,
          y: Math.random() * 100,
        }));

        store.dispatch(
          addWidget({
            type: 'chart',
            layout: { x: i % 12, y: Math.floor(i / 12), w: 2, h: 2, minW: 1, minH: 1 },
            props: {
              title: `Widget ${i}`,
              data: chartData,
            },
          })
        );
      }

      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(Object.keys(parsed.instances)).toHaveLength(100);
      expect(parsed.layout).toHaveLength(100);
    });
  });
});
