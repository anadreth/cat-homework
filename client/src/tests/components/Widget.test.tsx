import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createWidgetTestState } from '../test-utils';
import { Widget } from '@/components/Canvas/blocks/Widget';

describe('Widget Component', () => {
  it('should render chart widget from store', () => {
    const preloadedState = createWidgetTestState('test-chart', 'chart', {
      data: [
        { date: 'Jan', revenue: 100, profit: 50 },
        { date: 'Feb', revenue: 200, profit: 80 },
      ],
      index: 'date',
      categories: ['revenue', 'profit'],
      className: 'h-full',
    });

    renderWithProviders(<Widget widgetId="test-chart" widgetType="chart" />, {
      preloadedState,
    });

    // Chart should render without error (no error message displayed)
    const errorMessage = screen.queryByText(
      'Error: Chart widget requires data and categories'
    );
    expect(errorMessage).not.toBeInTheDocument();
  });

  it('should render table widget from store', () => {
    const preloadedState = createWidgetTestState('test-table', 'table', {
      data: [
        { id: '1', name: 'Alice', role: 'Engineer' },
        { id: '2', name: 'Bob', role: 'Designer' },
      ],
      columns: [
        { key: 'name', header: 'Name', align: 'left' },
        { key: 'role', header: 'Role', align: 'left' },
      ],
      idKey: 'id',
      caption: 'Team Members',
      filters: [],
    });

    renderWithProviders(<Widget widgetId="test-table" widgetType="table" />, {
      preloadedState,
    });

    // Table should render with caption
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('should render list widget from store', () => {
    const preloadedState = createWidgetTestState('test-list', 'list', {
      title: 'Tasks',
      items: [
        { id: '1', label: 'Task 1', description: 'Description 1' },
        { id: '2', label: 'Task 2', description: 'Description 2' },
      ],
    });

    renderWithProviders(<Widget widgetId="test-list" widgetType="list" />, {
      preloadedState,
    });

    // List should render with title and items
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should render text widget from store', () => {
    const preloadedState = createWidgetTestState('test-text', 'text', {
      title: 'Welcome',
      content: 'Hello, World!',
    });

    renderWithProviders(<Widget widgetId="test-text" widgetType="text" />, {
      preloadedState,
    });

    // Text widget should render with title and content
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should return null when widget not found in store', () => {
    // Create empty dashboard state (no widgets)
    const preloadedState = {
      core: {
        past: [],
        present: {
          dashboard: {
            version: 1,
            id: 'test-dashboard',
            name: 'Test Dashboard',
            instances: {},
            layout: [],
            meta: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          },
        },
        future: [],
      },
    };

    const { container } = renderWithProviders(
      <Widget widgetId="non-existent" widgetType="chart" />,
      { preloadedState }
    );

    // Should render nothing (null)
    expect(container.firstChild).toBeNull();
  });
});
