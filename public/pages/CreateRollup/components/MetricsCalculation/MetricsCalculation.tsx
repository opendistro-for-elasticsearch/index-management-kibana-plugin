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

import React, { ChangeEvent, Component, Fragment } from "react";
import {
  EuiBasicTable,
  EuiButton,
  EuiButtonEmpty,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
  EuiTableSelectionType,
  EuiCheckbox,
  EuiText,
  EuiFormRow,
  EuiPanel,
  EuiTitle,
  EuiFormHelpText,
  EuiHorizontalRule,
  EuiIcon,
  EuiPopover,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiCallOut,
  EuiTableSortingType,
  // @ts-ignore
  Pagination,
  // @ts-ignore
  Criteria,
} from "@elastic/eui";
import { AddFieldsColumns } from "../../utils/constants";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";
import { isNumericMapping } from "../../utils/helpers";
import { FieldItem, MetricItem } from "../../../../../models/interfaces";

interface MetricsCalculationProps {
  fieldsOption: FieldItem[];
  selectedMetrics: MetricItem[];
  metricError: string;
  onMetricSelectionChange: (selectedFields: MetricItem[]) => void;
}

interface MetricsCalculationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
  selectedFields: FieldItem[];
  allSelectedFields: FieldItem[];
  from: number;
  size: number;
  sortField: string;
  sortDirection: string;
  isDisableOpen: boolean;
  isEnableOpen: boolean;
  metricsShown: MetricItem[];
}

export default class MetricsCalculation extends Component<MetricsCalculationProps, MetricsCalculationState> {
  constructor(props: MetricsCalculationProps) {
    super(props);
    const { selectedMetrics } = this.props;
    this.state = {
      isModalVisible: false,
      searchText: "",
      selectedFieldType: [],
      selectedFields: [],
      allSelectedFields: [],
      metricsShown: selectedMetrics.slice(0, 10),
      from: 0,
      size: 10,
      sortField: "source_field",
      sortDirection: "desc",
      isDisableOpen: false,
      isEnableOpen: false,
    };
  }

  closeModal = () => this.setState({ isModalVisible: false });

  showModal = () => this.setState({ isModalVisible: true });

  closeDisable = () => this.setState({ isDisableOpen: false });

  showDisable = () => this.setState({ isDisableOpen: true });

  closeEnable = () => this.setState({ isEnableOpen: false });

  showEnable = () => this.setState({ isEnableOpen: true });

  onChangeFieldType = (options: EuiComboBoxOptionOption<String>[]): void => {
    this.setState({ selectedFieldType: options });
  };

  onSelectionChange = (selectedFields: FieldItem[]): void => {
    this.setState({ selectedFields });
  };

  onClickAdd() {
    const { onMetricSelectionChange, selectedMetrics } = this.props;
    const { selectedFields, allSelectedFields, from, size } = this.state;
    // Clone selectedMetrics
    let updatedMetrics = Array.from(selectedMetrics);
    const toAddFields = Array.from(selectedFields);
    // Loop through selectedFields to see if existing Metrics are removed

    selectedMetrics.map((metric) => {
      if (allSelectedFields.includes(metric.source_field)) {
        const index = toAddFields.indexOf(metric.source_field);
        toAddFields.splice(index, 1);
      }
    });
    const toAdd: MetricItem[] = toAddFields.map((field) => {
      return {
        source_field: field,
        all: false,
        min: false,
        max: false,
        sum: false,
        avg: false,
        value_count: false,
      };
    });
    const result = updatedMetrics.length ? updatedMetrics.concat(toAdd) : toAdd;
    onMetricSelectionChange(result);
    this.setState({
      allSelectedFields: allSelectedFields.concat(toAddFields),
      metricsShown: result.slice(from, from + size),
    });
    this.forceUpdate();
  }

  deleteField(item: MetricItem) {
    const { selectedMetrics, onMetricSelectionChange } = this.props;
    const { selectedFields, allSelectedFields, from, size } = this.state;

    selectedMetrics.splice(selectedMetrics.indexOf(item), 1);
    selectedFields.splice(selectedFields.indexOf(item.source_field), 1);
    allSelectedFields.splice(allSelectedFields.indexOf(item.source_field), 1);

    onMetricSelectionChange(selectedMetrics);
    this.setState({ selectedFields, allSelectedFields, metricsShown: selectedMetrics.slice(from, size) });
  }

  setChecked = (e: ChangeEvent<HTMLInputElement>, method: string, item: MetricItem): void => {
    const { selectedMetrics, onMetricSelectionChange } = this.props;
    const index = selectedMetrics.indexOf(item);
    const newItem: MetricItem = item;
    //There should be a smarter way to do this
    switch (method) {
      case "all": {
        if (!item.all) {
          newItem.all = true;
          newItem.min = true;
          newItem.max = true;
          newItem.sum = true;
          newItem.avg = true;
          newItem.value_count = true;
        } else {
          newItem.all = false;
        }
        break;
      }
      case "min": {
        newItem.min = !item.min;
        break;
      }
      case "max": {
        newItem.max = !item.max;
        break;
      }
      case "sum": {
        newItem.sum = !item.sum;
        break;
      }
      case "avg": {
        newItem.avg = !item.avg;
        break;
      }
      case "value_count": {
        newItem.value_count = !item.value_count;
        break;
      }
    }
    selectedMetrics[index] = newItem;
    onMetricSelectionChange(selectedMetrics);
  };

  onClickDisable(method: string) {
    const { selectedMetrics, onMetricSelectionChange } = this.props;
    selectedMetrics.map((metric) => {
      metric[method] = false;
    });
    onMetricSelectionChange(selectedMetrics);
  }

  onClickEnable(method: string) {
    const { selectedMetrics, onMetricSelectionChange } = this.props;
    selectedMetrics.map((metric) => {
      metric[method] = true;
    });
    onMetricSelectionChange(selectedMetrics);
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

  render() {
    const { fieldsOption, selectedMetrics, metricError } = this.props;
    const { isModalVisible, selectedFields, isDisableOpen, isEnableOpen, from, size, sortDirection, sortField, metricsShown } = this.state;
    const page = Math.floor(from / size);
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

    const selection: EuiTableSelectionType<FieldItem> = {
      selectable: (field) => isNumericMapping(field.type),
      onSelectionChange: this.onSelectionChange,
      initialSelected: selectedFields,
    };

    const metricsColumns = [
      {
        field: "source_field.label",
        name: "Field Name",
      },
      {
        field: "all",
        name: "All",
        align: "center",
        truncateText: true,
        render: (all: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox
                id={`all-${item.source_field.label}`}
                checked={all}
                onChange={(e) => this.setChecked(e, "all", item)}
                data-test-subj={`all-${item.source_field.label}`}
              />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "min",
        name: "Min",
        align: "center",
        render: (min: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox
                id={`min-${item.source_field.label}`}
                checked={min}
                onChange={(e) => this.setChecked(e, "min", item)}
                data-test-subj={`min-${item.source_field.label}`}
              />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "max",
        name: "Max",
        align: "center",
        render: (max: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox
                id={`max-${item.source_field.label}`}
                checked={max}
                onChange={(e) => this.setChecked(e, "max", item)}
                data-test-subj={`max-${item.source_field.label}`}
              />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "sum",
        name: "Sum",
        align: "center",
        render: (sum: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox
                id={`sum-${item.source_field.label}`}
                checked={sum}
                onChange={(e) => this.setChecked(e, "sum", item)}
                data-test-subj={`sum-${item.source_field.label}`}
              />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "avg",
        name: "Avg",
        align: "center",
        render: (avg: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox
                id={`avg-${item.source_field.label}`}
                checked={avg}
                onChange={(e) => this.setChecked(e, "avg", item)}
                data-test-subj={`avg-${item.source_field.label}`}
              />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "value_count",
        name: "Value count",
        align: "center",
        render: (value_count: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox
                id={`value_count-${item.source_field.label}`}
                checked={value_count}
                onChange={(e) => this.setChecked(e, "value_count", item)}
                data-test-subj={`valueCount-${item.source_field.label}`}
              />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        name: "Actions",
        actions: [
          {
            render: (item: MetricItem) => {
              return (
                <EuiIcon
                  type="crossInACircleFilled"
                  onClick={() => this.deleteField(item)}
                  data-test-subj={`delete-${item.source_field.label}`}
                />
              );
            },
          },
        ],
      },
    ];

    const disableActions = [
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("min");
        }}
        data-test-subj="disable_min"
      >
        Min
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("max");
        }}
        data-test-subj="disable_max"
      >
        Max
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("sum");
        }}
        data-test-subj="disable_sum"
      >
        Sum
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("avg");
        }}
        data-test-subj="disable_avg"
      >
        Avg
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("value_count");
        }}
        data-test-subj="disable_value_count"
      >
        Value count
      </EuiContextMenuItem>,
    ];

    const enableActions = [
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("min");
        }}
        data-test-subj="enable_min"
      >
        Min
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("max");
        }}
        data-test-subj="enable_max"
      >
        Max
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("sum");
        }}
        data-test-subj="enable_sum"
      >
        Sum
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("avg");
        }}
        data-test-subj="enable_avg"
      >
        Avg
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("value_count");
        }}
        data-test-subj="enable_value_count"
      >
        Value count
      </EuiContextMenuItem>,
    ];

    return (
      <EuiPanel>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiTitle size="m">
                  <h3>Additional metrics </h3>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="m" color="subdued">
                  <h2>{` (${selectedMetrics.length})`}</h2>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiTitle size="m">
                  <i> - optional </i>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiPopover
                  button={
                    <EuiButton iconType="arrowDown" iconSide="right" onClick={this.showDisable} disabled={selectedMetrics.length == 0}>
                      Disable all
                    </EuiButton>
                  }
                  isOpen={isDisableOpen}
                  closePopover={this.closeDisable}
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <EuiContextMenuPanel items={disableActions} />
                </EuiPopover>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiPopover
                  button={
                    <EuiButton iconType="arrowDown" iconSide="right" onClick={this.showEnable} disabled={selectedMetrics.length == 0}>
                      Enable all
                    </EuiButton>
                  }
                  isOpen={isEnableOpen}
                  closePopover={this.closeEnable}
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <EuiContextMenuPanel items={enableActions} />
                </EuiPopover>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.showModal} data-test-subj="addFieldsMetric">
                  Add fields
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup style={{ padding: "0px 10px" }}>
          <EuiFlexItem grow={3}>
            <EuiFormHelpText>
              You can aggregate additional fields from the source index into the target index. Rollup supports the terms aggregation (for
              all field types) and histogram aggregation (for numeric fields).
            </EuiFormHelpText>
          </EuiFlexItem>
          <EuiFlexItem grow={2} />
        </EuiFlexGroup>
        <EuiHorizontalRule margin="xs" />
        <div style={{ paddingLeft: "10px" }}>
          {metricError != "" && (
            <Fragment>
              <EuiCallOut color="danger">
                <p>{metricError}</p>
              </EuiCallOut>
              <EuiSpacer />
            </Fragment>
          )}

          <EuiBasicTable
            items={metricsShown}
            itemId="source_field"
            rowHeader="source_field"
            columns={metricsColumns}
            hasActions={true}
            noItemsMessage={
              <Fragment>
                <EuiSpacer />
                <EuiText>No fields added for metrics</EuiText>
                <EuiSpacer />
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem>
                    <EuiSpacer />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton onClick={this.showModal} data-test-subj="addFieldsMetricEmpty">
                      Add fields
                    </EuiButton>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiSpacer />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </Fragment>
            }
            tableLayout="auto"
            onChange={this.onTableChange}
            pagination={pagination}
            sorting={sorting}
          />
          <EuiSpacer size="s" />
          {isModalVisible && (
            <EuiOverlayMask>
              <EuiModal onClose={this.closeModal} style={{ padding: "5px 30px" }}>
                <EuiModalHeader>
                  <EuiModalHeaderTitle>Add fields</EuiModalHeaderTitle>
                </EuiModalHeader>

                <EuiModalBody>
                  <EuiForm title="Add fields">
                    <EuiBasicTable
                      items={fieldsOption}
                      itemId="label"
                      rowHeader="fieldName"
                      columns={AddFieldsColumns}
                      isSelectable={true}
                      selection={selection}
                      tableLayout="fixed"
                    />
                  </EuiForm>
                </EuiModalBody>

                <EuiModalFooter>
                  <EuiButtonEmpty onClick={this.closeModal} data-test-subj="addFieldsMetricCancel">
                    Cancel
                  </EuiButtonEmpty>
                  <EuiButton
                    fill
                    onClick={() => {
                      this.closeModal();
                      this.onClickAdd();
                    }}
                    data-test-subj="addFieldsMetricAdd"
                  >
                    Add
                  </EuiButton>
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}
        </div>
      </EuiPanel>
    );
  }
}
