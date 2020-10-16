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
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { DimensionItem, MetricItem } from "../../models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";

interface HistogramAndMetricsProps {
  rollupId: string;
  onChangeStep: (step: number) => void;
  timestamp: EuiComboBoxOptionOption<String>[];
  intervalValue: number;
  timezone: string;
  timeunit: string;
  selectedDimensionField: DimensionItem[];
}

interface HistogramAndMetricsState {
  from: number;
  size: number;
  sortField: string;
  sortDirection: string;
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
    render: (type) => (type == null ? "-" : type),
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
    field: "all",
    name: "All",
    align: "left",
    render: (all: boolean) => all && <EuiIcon type={"check"} />,
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

const sampleMetricItems: MetricItem[] = [
  {
    source_field: "On time rate",
    all: true,
    min: false,
    max: true,
    sum: false,
    avg: false,
    value_count: false,
  },
  {
    source_field: "Return rate",
    all: true,
    min: true,
    max: false,
    sum: false,
    avg: false,
    value_count: false,
  },
  {
    source_field: "OTIF rate",
    all: false,
    min: false,
    max: true,
    sum: false,
    avg: false,
    value_count: true,
  },
];

export default class HistogramAndMetrics extends Component<HistogramAndMetricsProps, HistogramAndMetricsState> {
  constructor(props: HistogramAndMetricsProps) {
    super(props);
    this.state = {
      from: 0,
      size: 10,
      sortField: "sequence",
      sortDirection: "desc",
    };
  }

  parseTimezone = (timezone: string): string => {
    let text;
    switch (timezone) {
      case "Pacific/Apia":
        text = "UTC +13 / +14 - Pacific/Apia";
        break;
      case "Pacific/Auckland":
        text = "UTC +12 / +13 - Pacific/Auckland";
        break;
      case "Pacific/Guadalcanal":
        text = "UTC +11 - Pacific/Guadalcanal";
        break;
      case "Australia/Sydney":
        text = "UTC +10:00 / +11:00 - Australia/Sydney";
        break;
      case "Australia/Darwin":
        text = "UTC +9:30 / +10:30 - Australia/Darwin";
        break;
      case "Asia/Tokyo":
        text = "UTC +9 - Asia/Tokyo";
        break;
      case "Asia/Shanghai":
        text = "UTC +8 - Asia/Shanghai";
        break;
      case "Asia/Ho_Chi_Minh":
        text = "UTC +7 - Asia/Ho Chi Minh";
        break;
      case "Asia/Dhaka":
        text = "UTC +6 - Asia/Dhaka";
        break;
      case "Asia/Kolkata":
        text = "UTC +5:30 - Asia/Kolkata";
        break;
      case "Asia/Karachi":
        text = "UTC +5 - Asia/Karachi";
        break;
      case "Asia/Yerevan":
        text = "UTC +4 Asia/Yerevan";
        break;
      case "Africa/Addis_Ababa":
        text = "UTC +3 - Africa/Addis Ababa";
        break;
      case "Africa/Cairo":
        text = "UTC +2 - Africa/Cairo";
        break;
      case "Europe/Paris":
        text = "UTC +1 / +2 - Europe/Paris";
        break;
      case "UTC +0":
        text = "UTC +0 - Europe/London";
        break;
      case "America/St_Johns":
        text = "UTC -2:30 / -3:30 - America/St Johns";
        break;
      case "America/Sao_Paulo":
        text = "UTC -3 - America/Sao Paulo";
        break;
      case "America/Puerto_Rico":
        text = "UTC -4 - America/Puerto Rico";
        break;
      case "America/Indiana/Indianapolis":
        text = "UTC -4 /-5 - America/Indiana/Indianapolis";
        break;
      case "-05:00":
        text = "UTC -5";
        break;
      case "America/Chicago":
        text = "UTC -5/ -6 - America/Chicago";
        break;
      case "America/Phoenix":
        text = "UTC -7 - America/Phoenix";
        break;
      case "-07:00":
        text = "UTC -7";
        break;
      case "America/Los_Angeles":
        text = "UTC -7 / -8 - America/Los Angeles";
        break;
      case "America/Anchorage":
        text = "UTC -8 / -9 - America/Anchorage";
        break;
      case "-10:00":
        text = "UTC -10";
        break;
      default:
        text = timezone;
    }
    return text;
  };

  parseTimeunit = (timeunit: string): string => {
    if (timeunit == "MINUTES" || timeunit == "m") return "minute(s)";
    else if (timeunit == "HOURS" || timeunit == "h") return "hour(s)";
    else if (timeunit == "SECONDS" || timeunit == "s") return "second(s)";
    else if (timeunit == "DAYS" || timeunit == "d") return "day(s)";
    else if (timeunit == "ms") return "millisecond(s)";

    return "";
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<DimensionItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  render() {
    const { onChangeStep, intervalValue, timestamp, timezone, timeunit, selectedDimensionField } = this.props;
    const { from, size } = this.state;
    const page = Math.floor(from / size);
    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: selectedDimensionField.length,
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
        title="Aggregation and metrics setting"
        titleSize="m"
      >
        <div style={{ padding: "15px" }}>
          <EuiSpacer size={"xs"} />
          <EuiText>
            <h3>Time aggregation</h3>
          </EuiText>
          <EuiSpacer size={"s"} />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Timestamp field</dt>
                <dd>{timestamp.length ? timestamp[0].label : ""}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Interval</dt>
                <dd>{`${intervalValue} ${this.parseTimeunit(timeunit)}`}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Timezone</dt>
                <dd>{this.parseTimezone(timezone)}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size={"m"} />
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
                  pagination={pagination}
                  onChange={this.onTableChange}
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
                <h3>{`(${sampleMetricItems.length})`}</h3>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
          {sampleMetricItems.length ? (
            <Fragment>
              <EuiPanel>
                <EuiBasicTable
                  items={sampleMetricItems}
                  rowHeader="source_field"
                  columns={metricsColumns}
                  tableLayout={"auto"}
                  pagination={pagination}
                  onChange={this.onTableChange}
                />
              </EuiPanel>
            </Fragment>
          ) : (
            <EuiText>
              <dd>No fields added for metrics</dd>
            </EuiText>
          )}

          <EuiSpacer size={"s"} />
        </div>
      </ContentPanel>
    );
  }
}
