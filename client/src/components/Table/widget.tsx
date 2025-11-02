import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table/blocks";
import { applyFilters, getAlignmentClass } from "@/lib/utils/table";

export type TextAlign = "left" | "center" | "right";

export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual";

export type TableFilter = {
  column: string;
  operator: FilterOperator;
  value: string | number;
};

export type TableColumn<
  TData extends Record<string, string | number>,
  TKey extends Extract<keyof TData, string>
> = {
  key: TKey;
  header: string;
  align?: TextAlign;
  footer?: string | number;
  colSpan?: number;
};

export type FooterCell = {
  value: string | number;
  colSpan?: number;
  align?: TextAlign;
};

export type TableWidgetProps<
  TData extends Record<string, string | number>,
  TIdKey extends Extract<keyof TData, string>
> = {
  data: TData[];
  columns: TableColumn<TData, Extract<keyof TData, string>>[];
  idKey: TIdKey;
  caption?: string;
  footer?: FooterCell[];
  filters?: TableFilter[];
};

export const TableWidget = <
  TData extends Record<string, string | number>,
  TIdKey extends Extract<keyof TData, string>
>(
  props: TableWidgetProps<TData, TIdKey>
) => {
  const { data = [], columns = [], idKey, caption, footer, filters } = props;
  const filteredData = applyFilters(data, filters);

  if (!columns || columns.length === 0) {
    return (
      <div style={{ padding: "1rem", color: "#ef4444" }}>
        <p>Error: Table widget requires columns configuration</p>
      </div>
    );
  }

  return (
    <TableRoot>
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableHeaderCell
                key={col.key}
                className={getAlignmentClass(col.align)}
              >
                {col.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((row) => (
            <TableRow key={String(row[idKey])}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={getAlignmentClass(col.align)}
                >
                  {row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {footer && footer.length > 0 && (
          <TableFoot>
            <TableRow>
              {footer.map((cell, idx) => (
                <TableHeaderCell
                  key={idx}
                  colSpan={cell.colSpan}
                  scope="row"
                  className={getAlignmentClass(cell.align)}
                >
                  {cell.value}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableFoot>
        )}
      </Table>
    </TableRoot>
  );
};
