import { AreaChart } from "@/components/AreaChart/blocks";

/**
 * Type-safe props for AreaChartWidget that ensures:
 * - data objects must contain the key specified in `index`
 * - data objects must contain all keys specified in `categories`
 * - all keys must be strings (not symbols or numbers)
 * - all values must be strings or numbers
 */
export type AreaChartWidgetProps<
  TData extends Record<string, string | number>,
  TIndex extends Extract<keyof TData, string>,
  TCategory extends Extract<keyof TData, string>
> = {
  data: TData[];
  index: TIndex;
  categories: TCategory[];
  className?: string;
  valueFormatter?: (value: number) => string;
  onValueChange?: (value: unknown) => void;
};

// Default value formatter
const defaultValueFormatter = (number: number): string =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

// Default onValueChange handler
const defaultOnValueChange = (value: unknown): void => {
  console.log(value);
};

// Example usage with type inference
export const AreaChartWidget = <
  TData extends Record<string, string | number>,
  TIndex extends Extract<keyof TData, string>,
  TCategory extends Extract<keyof TData, string>
>(
  props: AreaChartWidgetProps<TData, TIndex, TCategory>
) => {
  const {
    className = "h-full",
    valueFormatter = defaultValueFormatter,
    onValueChange = defaultOnValueChange,
    data = [],
    index,
    categories = [],
  } = props;

  if (!data || data.length === 0 || !categories || categories.length === 0) {
    return (
      <div style={{ padding: "1rem", color: "#ef4444" }}>
        <p>Error: Chart widget requires data and categories</p>
      </div>
    );
  }

  return (
    <AreaChart
      className={className}
      data={data}
      index={index}
      categories={categories}
      valueFormatter={valueFormatter}
      onValueChange={onValueChange}
    />
  );
};
