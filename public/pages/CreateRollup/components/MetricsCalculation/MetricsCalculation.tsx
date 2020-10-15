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
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { FieldItem, MetricItem } from "../../../../../models/interfaces";
import { AddFieldsColumns } from "../../utils/constants";

interface MetricsCalculationProps {
  fieldsOption: FieldItem[];
}

interface MetricsCalculationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
  selectedFields: FieldItem[];
}

const tempFieldTypeOptions = [{ label: "string" }, { label: "location" }, { label: "number" }, { label: "timestamp" }];

const sampleMetricItems: MetricItem[] = [
  {
    fieldName: "On time rate",
    all: true,
    min: false,
    max: true,
    sum: false,
    avg: false,
    value_count: false,
  },
  {
    fieldName: "Return rate",
    all: true,
    min: true,
    max: false,
    sum: false,
    avg: false,
    value_count: false,
  },
  {
    fieldName: "OTIF rate",
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
    field: "fieldName",
    name: "Field Name",
  },
  {
    field: "all",
    name: "All",
    truncateText: true,
    // render: (all: boolean) => {
    //   <EuiCheckbox id ={"all"} checked={all} onChange={()=>{all=!all}}/>
    // },
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
    field: "value_count",
    name: "Value count",
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
          <EuiBasicTable
            items={sampleMetricItems}
            rowHeader="numericField"
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
