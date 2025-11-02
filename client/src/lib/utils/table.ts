import type { TextAlign, TableFilter } from "@/components/Table/widget";

export const getAlignmentClass = (align?: TextAlign): string => {
  if (!align || align === "left") return "";
  if (align === "center") return "text-center";
  return "text-right";
};

export const applyFilters = <TData extends Record<string, string | number>>(
  data: TData[],
  filters?: TableFilter[]
): TData[] => {
  if (!filters || filters.length === 0) return data;

  return data.filter((row) => {
    return filters.every((filter) => {
      const cellValue = row[filter.column];
      const filterValue = filter.value;

      if (cellValue === undefined || cellValue === null) return false;

      switch (filter.operator) {
        case "equals":
          return cellValue === filterValue;
        case "notEquals":
          return cellValue !== filterValue;
        case "contains":
          return String(cellValue)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
        case "notContains":
          return !String(cellValue)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
        case "greaterThan":
          return Number(cellValue) > Number(filterValue);
        case "lessThan":
          return Number(cellValue) < Number(filterValue);
        case "greaterThanOrEqual":
          return Number(cellValue) >= Number(filterValue);
        case "lessThanOrEqual":
          return Number(cellValue) <= Number(filterValue);
        default:
          return true;
      }
    });
  });
};
