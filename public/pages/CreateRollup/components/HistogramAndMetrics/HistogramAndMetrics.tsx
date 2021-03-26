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
  EuiComboBoxOptionOption,
  EuiFlexGrid,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiBasicTable,
  EuiTableFieldDataColumnType,
  EuiPanel,
  EuiFlexGroup,
  // @ts-ignore
  Criteria,
  // @ts-ignore
  Pagination,
  EuiIcon,
  EuiTableSortingType,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";
import { parseTimeunit } from "../../utils/helpers";
import { DimensionItem, MetricItem } from "../../../../../models/interfaces";
import {
  AGGREGATION_AND_METRIC_SETTINGS,
  BaseAggregationAndMetricsState,
  BaseAggregationColumns, BaseMetricsColumns
} from "../../../Commons/BaseAggregationAndMetricSettings";

interface HistogramAndMetricsProps {
  rollupId: string;
  onChangeStep: (step: number) => void;
  timestamp: EuiComboBoxOptionOption<String>[];
  intervalType: string;
  intervalValue: number;
  timezone: string;
  timeunit: string;
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];
}

interface HistogramAndMetricsState extends BaseAggregationAndMetricsState {
  metricsShown: MetricItem[];
  dimensionsShown: DimensionItem[];
}


const _createFlowAggregateColumns: Readonly<EuiTableFieldDataColumnType<DimensionItem>>[] = [
  {
    field: "field.type",
    name: "Field type",
    align: "left",
    render: (type) => (type == undefined ? "-" : type),
  },
]

const _createFlowMetricsColumn: Readonly<EuiTableFieldDataColumnType<MetricItem>> =  {
    field: "all",
    name: "All",
    align: "center",
    render: (all: boolean) => all && <EuiIcon type="check" />,
  }


const aggregationColumns: Readonly<EuiTableFieldDataColumnType<DimensionItem>>[]
  = [...BaseAggregationColumns,..._createFlowAggregateColumns];

// Adding 'all' column at 1st index.
const metricsColumns: EuiTableFieldDataColumnType<MetricItem>[] =
  [...BaseMetricsColumns].splice(1, 0, _createFlowMetricsColumn);

export default class HistogramAndMetrics extends Component<HistogramAndMetricsProps, HistogramAndMetricsState> {
  constructor(props: HistogramAndMetricsProps) {
    super(props);
    const { selectedDimensionField, selectedMetrics } = this.props;
    this.state = {
      from: 0,
      size: 10,
      sortField: "sequence",
      sortDirection: "desc",
      metricsShown: selectedMetrics.slice(0, 10),
      dimensionsShown: selectedDimensionField.slice(0, 10),
      dimensionFrom: 0,
      dimensionSize: 10,
      dimensionSortField: "sequence",
      dimensionSortDirection: "desc",
    };
  }

  onTableChange = ({ page: tablePage, sort }: Criteria<MetricItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    const { selectedMetrics } = this.props;
    this.setState({
      from: page * size,
      size,
      sortField,
      sortDirection,
      metricsShown: selectedMetrics.slice(page * size, page * size + size),
    });
  };

  onDimensionTableChange = ({ page: tablePage, sort }: Criteria<DimensionItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    const { selectedDimensionField } = this.props;
    this.setState({
      dimensionFrom: page * size,
      dimensionSize: size,
      dimensionSortField: sortField,
      dimensionSortDirection: sortDirection,
      dimensionsShown: selectedDimensionField.slice(page * size, page * size + size),
    });
  };

  parseInterval(intervalType: string, intervalValue: number, timeunit: string): string {
    if (intervalType == "calendar") return "1 " + parseTimeunit(timeunit);
    return intervalValue + " " + parseTimeunit(timeunit);
  }

  render() {
    const {
      onChangeStep,
      intervalType,
      intervalValue,
      timestamp,
      timezone,
      timeunit,
      selectedDimensionField,
      selectedMetrics,
    } = this.props;
    const {
      from,
      size,
      sortDirection,
      sortField,
      metricsShown,
      dimensionFrom,
      dimensionSize,
      dimensionSortDirection,
      dimensionSortField,
      dimensionsShown,
    } = this.state;
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

    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {() => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Edit",
                    buttonProps: {
                      onClick: () => onChangeStep(2),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title={AGGREGATION_AND_METRIC_SETTINGS}
        titleSize="m"
      >
        <div style={{ padding: "15px" }}>
          <EuiSpacer size="xs" />
          <EuiText>
            <h3>Time aggregation</h3>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Timestamp field</dt>
                <dd>{timestamp.length ? timestamp[0].label : ""}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Interval</dt>
                <dd>{this.parseInterval(intervalType, intervalValue, timeunit)}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Timezone</dt>
                <dd>{timezone}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="m" />
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
