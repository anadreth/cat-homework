import { Button } from "@/components/Button/blocks";
import { RiAddLine } from "@remixicon/react";
import type { TableFilter } from "@/components/Table/widget";
import { FilterRow } from "./FilterRow";
import type { FieldErrors } from "react-hook-form";

export interface FilterEditorProps {
  value: TableFilter[];
  onChange: (filters: TableFilter[]) => void;
  availableColumns: string[];
  errors?: FieldErrors<Record<string, unknown>>;
}

export function FilterEditor({
  value = [],
  onChange,
  availableColumns,
  errors,
}: FilterEditorProps) {
  const filters = value;

  const handleAddFilter = () => {
    const newFilter: TableFilter = {
      column: availableColumns[0] || "",
      operator: "equals",
      value: "",
    };
    onChange([...filters, newFilter]);
  };

  const handleFilterChange = (index: number, updatedFilter: TableFilter) => {
    const newFilters = [...filters];
    newFilters[index] = updatedFilter;
    onChange(newFilters);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onChange(newFilters);
  };

  const getFilterErrors = (index: number) => {
    if (!errors) return undefined;
    if (Array.isArray(errors)) {
      return errors[index];
    }
    return errors[index];
  };

  return (
    <div className="space-y-3">
      {filters.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-4 text-center">
          <p className="text-sm text-gray-500">No filters applied</p>
          <p className="mt-1 text-xs text-gray-400">
            Click "Add Filter" to create a filter
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, index) => (
            <FilterRow
              key={index}
              filter={filter}
              availableColumns={availableColumns}
              onChange={(updatedFilter) =>
                handleFilterChange(index, updatedFilter)
              }
              onRemove={() => handleRemoveFilter(index)}
              errors={getFilterErrors(index)}
            />
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        onClick={handleAddFilter}
        className="w-full"
        disabled={availableColumns.length === 0}
      >
        <RiAddLine className="mr-1.5 h-4 w-4" />
        Add Filter
      </Button>

      {availableColumns.length === 0 && (
        <p className="text-xs text-gray-500">
          Add columns to the table first to enable filtering
        </p>
      )}
    </div>
  );
}
