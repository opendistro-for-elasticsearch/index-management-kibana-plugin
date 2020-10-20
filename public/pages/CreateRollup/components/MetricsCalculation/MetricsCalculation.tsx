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
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldSearch,
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
} from "@elastic/eui";
import { AddFieldsColumns } from "../../utils/constants";
import { FieldItem, MetricItem } from "../../models/interfaces";

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
  isDisableOpen: boolean;
  isEnableOpen: boolean;
}

const tempFieldTypeOptions = [{ label: "string" }, { label: "location" }, { label: "number" }, { label: "timestamp" }];

export default class MetricsCalculation extends Component<MetricsCalculationProps, MetricsCalculationState> {
  constructor(props: MetricsCalculationProps) {
    super(props);

    this.state = {
      isModalVisible: false,
      searchText: "",
      selectedFieldType: [],
      selectedFields: [],
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

  onChangeSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ searchText: e.target.value });
  };

  onChangeFieldType = (options: EuiComboBoxOptionOption<String>[]): void => {
    this.setState({ selectedFieldType: options });
  };

  onSelectionChange = (selectedFields: FieldItem[]): void => {
    this.setState({ selectedFields });
  };

  onClickAdd() {
    const { onMetricSelectionChange, selectedMetrics } = this.props;
    const { selectedFields } = this.state;
    // Clone selectedMetrics
    let updatedMetrics = Array.from(selectedMetrics);
    const toAddFields = Array.from(selectedFields);
    // Loop through selectedFields to see if existing Metrics are removed

    selectedMetrics.map((metric) => {
      //If does not exist in new selection, don't add this metric.
      if (!selectedFields.includes(metric.source_field)) {
        updatedMetrics.splice(updatedMetrics.indexOf(metric), 1);
      }
      //If exists, delete it from toAddFields so that it doesn't get added again.
      else {
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
    onMetricSelectionChange(updatedMetrics.length ? updatedMetrics.concat(toAdd) : toAdd);
  }

  deleteField(item: MetricItem) {
    const { selectedMetrics, onMetricSelectionChange } = this.props;
    selectedMetrics.splice(selectedMetrics.indexOf(item), 1);
    onMetricSelectionChange(selectedMetrics);
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

  render() {
    const { fieldsOption, selectedMetrics, metricError } = this.props;
    const { isModalVisible, searchText, selectedFieldType, selectedFields, isDisableOpen, isEnableOpen } = this.state;

    const selection: EuiTableSelectionType<FieldItem> = {
      selectable: (field) =>
        field.type == "integer" || field.type == "float" || field.type == "long" || field.type == "double" || field.type == "double",
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
        truncateText: true,
        render: (all: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"all"} checked={all} onChange={(e) => this.setChecked(e, "all", item)} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "min",
        name: "Min",
        render: (min: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"min"} checked={min} onChange={(e) => this.setChecked(e, "min", item)} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "max",
        name: "Max",
        render: (max: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"max"} checked={max} onChange={(e) => this.setChecked(e, "max", item)} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "sum",
        name: "Sum",
        render: (sum: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"sum"} checked={sum} onChange={(e) => this.setChecked(e, "sum", item)} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "avg",
        name: "Avg",
        render: (avg: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"avg"} checked={avg} onChange={(e) => this.setChecked(e, "avg", item)} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "value_count",
        name: "Value count",
        render: (value_count: boolean, item: MetricItem) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"value_count"} checked={value_count} onChange={(e) => this.setChecked(e, "value_count", item)} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        name: "Actions",
        actions: [
          {
            render: (item: MetricItem) => {
              return <EuiIcon type={"crossInACircleFilled"} onClick={() => this.deleteField(item)} />;
            },
          },
        ],
      },
    ];

    const disableActions = [
      <EuiContextMenuItem
        key="disable_min"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("min");
        }}
      >
        Min
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="disable_max"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("max");
        }}
      >
        Max
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="disable_sum"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("sum");
        }}
      >
        Sum
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="disable_avg"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("avg");
        }}
      >
        Avg
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="disable_value_count"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeDisable();
          this.onClickDisable("value_count");
        }}
      >
        Value count
      </EuiContextMenuItem>,
    ];

    const enableActions = [
      <EuiContextMenuItem
        key="Min"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("min");
        }}
      >
        Min
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="enable_max"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("max");
        }}
      >
        Max
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="enable_sum"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("sum");
        }}
      >
        Sum
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="enable_avg"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("avg");
        }}
      >
        Avg
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="enable_value_count"
        icon="empty"
        disabled={selectedMetrics.length == 0}
        onClick={() => {
          this.closeEnable();
          this.onClickEnable("value_count");
        }}
      >
        Value count
      </EuiContextMenuItem>,
    ];

    // @ts-ignore
    return (
      <EuiPanel>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiFlexGroup gutterSize={"xs"}>
              <EuiFlexItem grow={false}>
                <EuiTitle size={"m"}>
                  <h3>Additional metrics </h3>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size={"m"} color={"subdued"}>
                  <h2>{` (${selectedMetrics.length})`}</h2>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiTitle size={"m"}>
                  <i>{" - optional "}</i>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize={"xs"}>
              <EuiFlexItem grow={false}>
                <EuiPopover
                  button={
                    <EuiButton iconType={"arrowDown"} iconSide={"right"} onClick={this.showDisable} disabled={selectedMetrics.length == 0}>
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
                    <EuiButton iconType={"arrowDown"} iconSide={"right"} onClick={this.showEnable} disabled={selectedMetrics.length == 0}>
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
                <EuiButton onClick={this.showModal}>Add fields</EuiButton>
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
              <EuiCallOut color={"danger"}>
                <p>{metricError}</p>
              </EuiCallOut>
              <EuiSpacer />
            </Fragment>
          )}

          <EuiBasicTable
            items={selectedMetrics}
            itemId={"source_field"}
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
                    <EuiButton onClick={this.showModal}>Add fields</EuiButton>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiSpacer />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </Fragment>
            }
            tableLayout={"auto"}
          />
          <EuiSpacer size="s" />
          {isModalVisible && (
            <EuiOverlayMask>
              <EuiModal onClose={this.closeModal} style={{ padding: "5px 30px" }}>
                <EuiModalHeader>
                  <EuiModalHeaderTitle>Add fields</EuiModalHeaderTitle>
                </EuiModalHeader>

                <EuiModalBody>
                  <EuiForm title={"Add fields"}>
                    <EuiFlexGroup>
                      <EuiFlexItem grow={2}>
                        <EuiFieldSearch
                          placeholder="Search field name"
                          value={searchText}
                          onChange={this.onChangeSearch}
                          isClearable={true}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={1}>
                        <EuiComboBox
                          placeholder="Field type"
                          options={tempFieldTypeOptions}
                          selectedOptions={selectedFieldType}
                          onChange={this.onChangeFieldType}
                          isClearable={true}
                          singleSelection={true}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiBasicTable
                      items={fieldsOption}
                      itemId={"label"}
                      rowHeader="fieldName"
                      columns={AddFieldsColumns}
                      isSelectable={true}
                      selection={selection}
                      tableLayout={"fixed"}
                    />
                  </EuiForm>
                </EuiModalBody>

                <EuiModalFooter>
                  <EuiButtonEmpty onClick={this.closeModal}>Cancel</EuiButtonEmpty>
                  <EuiButton
                    fill
                    onClick={() => {
                      this.closeModal();
                      this.onClickAdd();
                    }}
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
