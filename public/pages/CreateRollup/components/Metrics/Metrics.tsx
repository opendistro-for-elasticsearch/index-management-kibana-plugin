/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React, { ChangeEvent, Component } from "react";
import { EuiSpacer } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface MetricsProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

const metricColumns = [
  {
    field: "numericField",
    name: "Numeric field",
    sortable: true,
  },
  {
    field: "min",
    name: "Min",
  },
  {
    field: "max",
    name: "Max",
  },
  {
    field: "sum",
    name: "Sum",
  },
  {
    field: "avg",
    name: "Avg",
  },
  {
    field: "valueCount",
    name: "Value Count",
  },
  {
    field: "actions",
    name: "Actions",
  },
];
export default class Metrics extends Component<MetricsProps> {
  render() {
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Metrics" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
        </div>
      </ContentPanel>
    );
  }
}