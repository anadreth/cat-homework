import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AreaChartWidget } from '@/components/AreaChart/widget';

describe('AreaChartWidget', () => {
  it('should render chart with valid data and categories', () => {
    const data = [
      { date: 'Jan', revenue: 100, profit: 50 },
      { date: 'Feb', revenue: 200, profit: 80 },
      { date: 'Mar', revenue: 150, profit: 60 },
    ];

    render(
      <AreaChartWidget
        data={data}
        index="date"
        categories={['revenue', 'profit']}
      />
    );

    // Chart should render without error (no error message displayed)
    const errorMessage = screen.queryByText(
      'Error: Chart widget requires data and categories'
    );
    expect(errorMessage).not.toBeInTheDocument();
  });

  it('should show error message when data is empty', () => {
    render(
      <AreaChartWidget
        data={[]}
        index="date"
        categories={['revenue', 'profit']}
      />
    );

    // Error message should be displayed
    expect(
      screen.getByText('Error: Chart widget requires data and categories')
    ).toBeInTheDocument();
  });

  it('should show error message when categories are empty', () => {
    const data = [
      { date: 'Jan', revenue: 100, profit: 50 },
      { date: 'Feb', revenue: 200, profit: 80 },
    ];

    render(<AreaChartWidget data={data} index="date" categories={[]} />);

    // Error message should be displayed
    expect(
      screen.getByText('Error: Chart widget requires data and categories')
    ).toBeInTheDocument();
  });
});
