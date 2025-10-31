import { TableWidget } from "./components/Table/widget";
import { AreaChartWidget } from "./components/AreaChart/widget";
import { InputWidget } from "./components/Input/widget";
import { CheckboxWidget } from "./components/Checkbox/widget";
import { LabelWidget } from "./components/Label/widget";
import { SelectWidget } from "./components/Select/widget";
import { tableData } from "./mock/widgets";

function App() {
  return (
    <>
      <TableWidget
        data={tableData}
        idKey="id"
        caption="Recent invoices."
        columns={[
          { key: "name", header: "Name", align: "left" },
          { key: "sales", header: "Sales ($)", align: "right" },
          { key: "region", header: "Region", align: "left" },
          { key: "status", header: "Status", align: "left" },
          { key: "hours", header: "Working Hours (h)", align: "right" },
        ]}
        footer={[
          { value: "4,642", colSpan: 2, align: "right" },
          { value: "497", colSpan: 3, align: "right" },
        ]}
      />
      <AreaChartWidget
        data={[
          {
            date: "1",
            symbol: "123",
          },
        ]}
        index="date"
        categories={["symbol"]}
      />
      <InputWidget />
      <CheckboxWidget />
      <LabelWidget />
      <SelectWidget />
    </>
  );
}

export default App;
