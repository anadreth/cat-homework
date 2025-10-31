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
    className = "h-80",
    valueFormatter = defaultValueFormatter,
    onValueChange = defaultOnValueChange,
    data,
    index,
    categories,
  } = props;

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
