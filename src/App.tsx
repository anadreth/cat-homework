import { TableWidget } from "./components/Table/widget";
import { AreaChartWidget } from "./components/AreaChart/widget";
import { InputWidget } from "./components/Input/widget";
import { CheckboxWidget } from "./components/Checkbox/widget";
import { LabelWidget } from "./components/Label/widget";
import { SelectWidget } from "./components/Select/widget";

function App() {
  return (
    <>
      <TableWidget />
      <AreaChartWidget />
      <InputWidget />
      <CheckboxWidget />
      <LabelWidget />
      <SelectWidget />
    </>
  );
}

export default App;
