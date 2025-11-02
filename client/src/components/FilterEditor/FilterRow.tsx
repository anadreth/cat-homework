import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { Input } from "@/components/Input/blocks";
import { Button } from "@/components/Button/blocks";
import { RiCloseLine } from "@remixicon/react";
import type { TableFilter, FilterOperator } from "@/components/Table/widget";
import { OPERATORS, OPERATOR_LABELS } from "@/constants/operators";

type FilterRowProps = {
  filter: TableFilter;
  availableColumns: string[];
  onChange: (filter: TableFilter) => void;
  onRemove: () => void;
  errors?: {
    column?: { message?: string };
    operator?: { message?: string };
    value?: { message?: string };
  };
};

export function FilterRow({
  filter,
  availableColumns,
  onChange,
  onRemove,
  errors,
}: FilterRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 md:flex-row md:items-start">
        <div className="flex-1">
          <Select
            value={filter.column}
            onValueChange={(value) => onChange({ ...filter, column: value })}
          >
            <SelectTrigger className={errors?.column ? "border-red-500" : ""}>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {availableColumns.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-gray-500">
                  No columns available
                </div>
              ) : (
                availableColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors?.column && (
            <p className="mt-1 text-xs text-red-600">{errors.column.message}</p>
          )}
        </div>

        <div className="flex-1">
          <Select
            value={filter.operator}
            onValueChange={(value) =>
              onChange({ ...filter, operator: value as FilterOperator })
            }
          >
            <SelectTrigger className={errors?.operator ? "border-red-500" : ""}>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.operator && (
            <p className="mt-1 text-xs text-red-600">
              {errors.operator.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <Input
            value={filter.value}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = Number(value);
              onChange({
                ...filter,
                value: !isNaN(numValue) && value !== "" ? numValue : value,
              });
            }}
            placeholder="Value"
            className={`w-full ${errors?.value ? "border-red-500" : ""}`}
          />
          {errors?.value && (
            <p className="mt-1 text-xs text-red-600">{errors.value.message}</p>
          )}
        </div>

        <Button
          variant="ghost"
          onClick={onRemove}
          className="h-9 px-2 md:px-3"
          title="Remove filter"
        >
          <RiCloseLine className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
