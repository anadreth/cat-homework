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

/**
 * Text alignment options for table cells
 */
type TextAlign = "left" | "center" | "right";

/**
 * Column configuration for a single table column
 * Ensures the key matches a property from the data type
 */
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

/**
 * Footer cell configuration
 */
export type FooterCell = {
  value: string | number;
  colSpan?: number;
  align?: TextAlign;
};

/**
 * Type-safe props for TableWidget that ensures:
 * - data objects contain all keys specified in columns
 * - all keys must be strings (not symbols or numbers)
 * - all values must be strings or numbers
 * - idKey must exist in data for row keys
 */
export type TableWidgetProps<
  TData extends Record<string, string | number>,
  TIdKey extends Extract<keyof TData, string>
> = {
  data: TData[];
  columns: TableColumn<TData, Extract<keyof TData, string>>[];
  idKey: TIdKey;
  caption?: string;
  footer?: FooterCell[];
};

// Alignment helper
const getAlignmentClass = (align?: TextAlign): string => {
  if (!align || align === "left") return "";
  if (align === "center") return "text-center";
  return "text-right";
};

/**
 * Type-safe, configurable Table widget
 */
export const TableWidget = <
  TData extends Record<string, string | number>,
  TIdKey extends Extract<keyof TData, string>
>(
  props: TableWidgetProps<TData, TIdKey>
) => {
  const { data, columns, idKey, caption, footer } = props;

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
          {data.map((row) => (
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
