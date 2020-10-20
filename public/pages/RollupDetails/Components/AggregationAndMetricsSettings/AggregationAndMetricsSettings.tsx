/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { Component, Fragment } from "react";
import {
  EuiFlexGrid,
  EuiSpacer,
  EuiFlexItem,
  EuiText,
  EuiFlexGroup,
  EuiPanel,
  EuiBasicTable,
  EuiIcon,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { DimensionItem, MetricItem } from "../../../CreateRollup/models/interfaces";
import { parseTimezone } from "../../../CreateRollup/utils/helpers";

interface AggregationAndMetricsSettingsProps {
  timestamp: string;
  histogramInterval: string;
  timezone: string;
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];
}
const aggregationColumns: EuiTableFieldDataColumnType<DimensionItem>[] = [
  {
    field: "sequence",
    name: "Sequence",
    sortable: true,
    align: "left",
    dataType: "number",
  },
  {
    field: "field.label",
    name: "Field name",
    align: "left",
  },
  {
    field: "field.type",
    name: "Field type",
    align: "left",
    render: (type: string) => (type == null ? "-" : type),
  },
  {
    field: "aggregationMethod",
    name: "Aggregation method",
    align: "left",
  },
  {
    field: "interval",
    name: "Interval",
    dataType: "number",
    align: "left",
    render: (interval: null | number) => {
      if (interval == null) return "-";
      else return `${interval}`;
    },
  },
];

const metricsColumns = [
  {
    field: "source_field",
    name: "Field Name",
  },
  {
    field: "min",
    name: "Min",
    render: (min: boolean) => min && <EuiIcon type={"check"} />,
  },
  {
    field: "max",
    name: "Max",
    render: (max: boolean) => max && <EuiIcon type={"check"} />,
  },
  {
    field: "sum",
    name: "Sum",
    render: (sum: boolean) => sum && <EuiIcon type={"check"} />,
  },
  {
    field: "avg",
    name: "Avg",
    render: (avg: boolean) => avg && <EuiIcon type={"check"} />,
  },
  {
    field: "value_count",
    name: "Value count",
    render: (value_count: boolean) => value_count && <EuiIcon type={"check"} />,
  },
];

export default class AggregationAndMetricsSettings extends Component<AggregationAndMetricsSettingsProps> {
  constructor(props: AggregationAndMetricsSettingsProps) {
    super(props);
  }

  render() {
    const { timestamp, histogramInterval, timezone, selectedDimensionField, selectedMetrics } = this.props;

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Aggregation and metrics settings" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size={"s"} />
          <EuiText>
            <h3>Additional metrics</h3>
          </EuiText>
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Timestamp field</dt>
                <dd>{timestamp}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Interval</dt>
                <dd>{histogramInterval}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Timezone</dt>
                <dd>{parseTimezone(timezone)}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size={"s"} />
          <EuiFlexGroup gutterSize={"xs"}>
            <EuiFlexItem grow={false}>
              <EuiText>
                <h3>Additional aggregations</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText color={"subdued"} textAlign={"left"}>
                <h3>{`(${selectedDimensionField.length})`}</h3>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          {selectedDimensionField.length ? (
            <Fragment>
              <EuiPanel>
                <EuiBasicTable
                  items={selectedDimensionField}
                  rowHeader={"sequence"}
                  columns={aggregationColumns}
                  tableLayout={"auto"}
                  noItemsMessage={"No fields added for aggregations"}
                />
              </EuiPanel>
            </Fragment>
          ) : (
            <EuiText>
              <dd>No field added for aggregation</dd>
            </EuiText>
          )}
          <EuiSpacer size={"m"} />

          <EuiSpacer />
          <EuiFlexGroup gutterSize={"xs"}>
            <EuiFlexItem grow={false}>
              <EuiText>
                <h3>Additional metrics</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText color={"subdued"} textAlign={"left"}>
                <h3>{`(${selectedMetrics.length})`}</h3>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
          {selectedMetrics.length ? (
            <Fragment>
              <EuiPanel>
                <EuiBasicTable items={selectedMetrics} rowHeader="source_field" columns={metricsColumns} tableLayout={"auto"} />
              </EuiPanel>
            </Fragment>
          ) : (
            <EuiText>
              <dd>No fields added for metrics</dd>
            </EuiText>
          )}
        </div>
      </ContentPanel>
    );
  }
}
