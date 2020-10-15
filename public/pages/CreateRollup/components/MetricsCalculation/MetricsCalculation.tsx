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
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { AddFieldsColumns } from "../../utils/constants";
import { FieldItem, MetricItem } from "../../models/interfaces";

interface MetricsCalculationProps {
  fieldsOption: FieldItem[];
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
const setChecked = (e: ChangeEvent<HTMLInputElement>): void => {};

const metricsColumns = [
  {
    field: "source_field",
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
];

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

  render() {
    const { fieldsOption } = this.props;
    const { isModalVisible, searchText, selectedFieldType } = this.state;

    //TODO: check if need to filter type of fields to numbers
    const selection: EuiTableSelectionType<FieldItem> = {
      // selectable: (field) => (field.type == 'integer'||'float'||'long'),
      onSelectionChange: this.onSelectionChange,
    };

    return (
      <ContentPanel
        bodyStyles={{ padding: "initial" }}
        actions={
          <ModalConsumer>
            {() => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Disable all",
                    buttonProps: {
                      iconType: "arrowDown",
                      iconSide: "right",
                      onClick: () => this.showModal(),
                    },
                  },
                  {
                    text: "Enable all",
                    buttonProps: {
                      iconType: "arrowDown",
                      iconSide: "right",
                      onClick: () => this.showModal(),
                    },
                  },
                  {
                    text: "Add fields",
                    buttonProps: {
                      onClick: () => this.showModal(),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        title={`Additional metrics - optional (0)`}
        titleSize="m"
      >
        <div style={{ paddingLeft: "10px" }}>
          {/*TODO: Figure out row header*/}
          <EuiBasicTable
            items={sampleMetricItems}
            rowHeader="source_field"
            columns={metricsColumns}
            noItemsMessage={
              <Fragment>
                <EuiSpacer />
                <EuiText>No field added for metrics</EuiText>
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
                      noItemsMessage="No field added for aggregation"
                      isSelectable={true}
                      selection={selection}
                      tableLayout={"auto"}
                    />
                  </EuiForm>
                </EuiModalBody>

                <EuiModalFooter>
                  <EuiButtonEmpty onClick={this.closeModal}>Cancel</EuiButtonEmpty>
                  <EuiButton fill onClick={this.closeModal}>
                    Add
                  </EuiButton>
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}
          {/*TODO: Hide the empty option message when selectedMetric.length!=0*/}
          {
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
          }
        </div>
      </ContentPanel>
    );
  }
}
