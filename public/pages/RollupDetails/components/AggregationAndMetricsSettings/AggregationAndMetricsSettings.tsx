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
  //@ts-ignore
  Criteria,
  //@ts-ignore
  Pagination,
  EuiTableSortingType,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { DimensionItem } from "../../../CreateRollup/models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";
import { parseTimeunit } from "../../../CreateRollup/utils/helpers";
import { FieldItem, MetricItem } from "../../../../../models/interfaces";

interface AggregationAndMetricsSettingsProps {
  timestamp: string;
  histogramInterval: string;
  timezone: string;
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];
  metricsShown: MetricItem[];
  dimensionsShown: DimensionItem[];
  onChangeDimensionsShown: (from: number, size: number) => void;
  onChangeMetricsShown: (from: number, size: number) => void;
}

interface AggregationAndMetricsSettingsState {
  from: number;
  size: number;
  sortField: string;
  sortDirection: string;
  dimensionFrom: number;
  dimensionSize: number;
  dimensionSortField: string;
  dimensionSortDirection: string;
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
    align: "center",
    render: (min: boolean) => min && <EuiIcon type="check" />,
  },
  {
    field: "max",
    name: "Max",
    align: "center",
    render: (max: boolean) => max && <EuiIcon type="check" />,
  },
  {
    field: "sum",
    name: "Sum",
    align: "center",
    render: (sum: boolean) => sum && <EuiIcon type="check" />,
  },
  {
    field: "avg",
    name: "Avg",
    align: "center",
    render: (avg: boolean) => avg && <EuiIcon type="check" />,
  },
  {
    field: "value_count",
    name: "Value count",
    align: "center",
    render: (value_count: boolean) => value_count && <EuiIcon type="check" />,
  },
];

export default class AggregationAndMetricsSettings extends Component<
  AggregationAndMetricsSettingsProps,
  AggregationAndMetricsSettingsState
> {
  constructor(props: AggregationAndMetricsSettingsProps) {
    super(props);
    this.state = {
      from: 0,
      size: 10,
      sortField: "sequence",
      sortDirection: "desc",
      dimensionFrom: 0,
      dimensionSize: 10,
      dimensionSortField: "sequence",
      dimensionSortDirection: "desc",
    };
  }

  onTableChange = ({ page: tablePage, sort }: Criteria<FieldItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    const { onChangeMetricsShown } = this.props;
    this.setState({
      from: page * size,
      size,
      sortField,
      sortDirection,
    });
    onChangeMetricsShown(page * size, page * size + size);
  };

  onDimensionTableChange = ({ page: tablePage, sort }: Criteria<DimensionItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    const { onChangeDimensionsShown } = this.props;
    this.setState({
      dimensionFrom: page * size,
      dimensionSize: size,
      dimensionSortField: sortField,
      dimensionSortDirection: sortDirection,
    });
    onChangeDimensionsShown(page * size, size);
  };

  render() {
    const { timestamp, histogramInterval, timezone, selectedDimensionField, selectedMetrics, dimensionsShown, metricsShown } = this.props;
    const { from, size, sortDirection, sortField, dimensionFrom, dimensionSize, dimensionSortDirection, dimensionSortField } = this.state;
    const page = Math.floor(from / size);
    const dimensionPage = Math.floor(dimensionFrom / dimensionSize);
    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: selectedMetrics.length,
    };
    const sorting: EuiTableSortingType<MetricItem> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };
    const dimensionPagination: Pagination = {
      pageIndex: dimensionPage,
      pageSize: dimensionSize,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: selectedDimensionField.length,
    };

    const dimensionSorting: EuiTableSortingType<DimensionItem> = {
      sort: {
        direction: dimensionSortDirection,
        field: dimensionSortField,
      },
    };

    const intervalValue = histogramInterval.match(/(\d+)/);
    const intervalUnit = histogramInterval.match(/[a-zA-Z]+/g);
    let interval = "";
    if (intervalValue && intervalUnit) {
      interval = intervalValue[0] + " " + parseTimeunit(intervalUnit[0]);
    }
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Aggregation and metrics settings" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiText>
            <h3>Additional metrics</h3>
          </EuiText>
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Timestamp field</dt>
                <dd>{timestamp}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Interval</dt>
                <dd>{interval}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Timezone</dt>
                <dd>{timezone}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="s" />
          <EuiFlexGroup gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiText>
                <h3>Additional aggregations</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText color="subdued" textAlign="left">
                <h3>{`(${selectedDimensionField.length})`}</h3>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          {selectedDimensionField.length ? (
            <Fragment>
              <EuiPanel>
                <EuiBasicTable
                  items={dimensionsShown}
                  rowHeader="sequence"
                  columns={aggregationColumns}
                  tableLayout="auto"
                  noItemsMessage="No fields added for aggregations"
                  pagination={dimensionPagination}
                  sorting={dimensionSorting}
                  onChange={this.onDimensionTableChange}
                />
              </EuiPanel>
            </Fragment>
          ) : (
            <EuiText>
              <dd>No fields added for aggregation</dd>
            </EuiText>
          )}
          <EuiSpacer size="m" />

          <EuiSpacer />
          <EuiFlexGroup gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiText>
                <h3>Additional metrics</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText color="subdued" textAlign="left">
                <h3>{`(${selectedMetrics.length})`}</h3>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
          {selectedMetrics.length ? (
            <Fragment>
              <EuiPanel>
                <EuiBasicTable
                  items={metricsShown}
                  rowHeader="source_field"
                  columns={metricsColumns}
                  tableLayout="auto"
                  pagination={pagination}
                  sorting={sorting}
                  onChange={this.onTableChange}
                  noItemsMessage="No fields added for metrics"
                />
              </EuiPanel>
            </Fragment>
          ) : (
            <EuiText>
              <dd>No fields added for metrics</dd>
            </EuiText>
          )}
          <EuiSpacer size="s" />
        </div>
      </ContentPanel>
    );
  }
}
