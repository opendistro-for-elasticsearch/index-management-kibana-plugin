import { EuiEmptyPrompt, EuiPanel } from "@elastic/eui";
import React from "react";

export default function PreviewEmptyPrompt() {
  return (
    <EuiPanel>
      <EuiEmptyPrompt
        title={<h4> No fields selected</h4>}
        body={<p>From the table above, select a field you want to transform by clicking the “plus” button next to the field name</p>}
      />
    </EuiPanel>
  );
}
