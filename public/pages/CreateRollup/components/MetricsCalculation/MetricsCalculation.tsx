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
  CustomItemAction,
} from "@elastic/eui";
import { AddFieldsColumns } from "../../utils/constants";
import { DimensionItem, FieldItem, MetricItem } from "../../models/interfaces";

interface MetricsCalculationProps {
  fieldsOption: FieldItem[];
  selectedMetrics: MetricItem[];
  onMetricSelectionChange: (selectedFields: MetricItem[]) => void;
}

interface MetricsCalculationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
  selectedFields: FieldItem[];
  //TODO: Add an 2D array to store checked metrics, or list of boolean[]
  checks: boolean[][];
}

const tempFieldTypeOptions = [{ label: "string" }, { label: "location" }, { label: "number" }, { label: "timestamp" }];

const sampleMetricItems: MetricItem[] = [
  {
    source_field: { label: "On time rate" },
    all: true,
    min: false,
    max: true,
    sum: false,
    avg: false,
    value_count: false,
  },
  {
    source_field: { label: "Return rate" },
    all: true,
    min: true,
    max: false,
    sum: false,
    avg: false,
    value_count: false,
  },
  {
    source_field: { label: "OTIF rate" },
    all: false,
    min: false,
    max: true,
    sum: false,
    avg: false,
    value_count: true,
  },
];
const setChecked = (e: ChangeEvent<HTMLInputElement>): void => {};

export default class MetricsCalculation extends Component<MetricsCalculationProps, MetricsCalculationState> {
  constructor(props: MetricsCalculationProps) {
    super(props);

    this.state = {
      isModalVisible: false,
      searchText: "",
      selectedFieldType: [],
      selectedFields: [],
      checks: [],
    };
  }

  closeModal = () => this.setState({ isModalVisible: false });

  showModal = () => this.setState({ isModalVisible: true });

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
    //Clone selectedMetrics
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

  render() {
    const { fieldsOption, selectedMetrics } = this.props;
    const { isModalVisible, searchText, selectedFieldType, selectedFields } = this.state;

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
        render: (all: boolean) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"all"} checked={all} onChange={setChecked} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "min",
        name: "Min",
        render: (min: boolean) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"min"} checked={min} onChange={setChecked} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "max",
        name: "Max",
        render: (max: boolean) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"max"} checked={max} onChange={setChecked} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "sum",
        name: "Sum",
        render: (sum: boolean) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"sum"} checked={sum} onChange={setChecked} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "avg",
        name: "Avg",
        render: (avg: boolean) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"avg"} checked={avg} onChange={setChecked} />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "value_count",
        name: "Value count",
        render: (value_count: boolean) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiCheckbox id={"value_count"} checked={value_count} onChange={setChecked} />
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
                <EuiTitle size={"m"}>
                  <i>{" - optional "}</i>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText size={"m"} color={"subdued"}>
                  <h2>{` (${selectedMetrics.length})`}</h2>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize={"xs"}>
              <EuiFlexItem grow={false}>
                <EuiButton iconType={"arrowDown"} iconSide={"right"}>
                  Disable all
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton iconType={"arrowDown"} iconSide={"right"}>
                  Enable all
                </EuiButton>
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
          {/*TODO: Figure out row header*/}
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
                    {/*TODO: create fake list of items, and figure out how to retrieve the selections for table*/}
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
