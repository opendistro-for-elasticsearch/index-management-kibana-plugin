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
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { DimensionItem, MetricItem } from "../../../../../models/interfaces";

interface MetricsCalculationProps {}

interface MetricsCalculationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
  selectedFields: ManagedCatIndex[];
}

const tempFieldTypeOptions = [{ label: "string" }, { label: "location" }, { label: "number" }, { label: "timestamp" }];

const addFields = (
  searchText: string,
  onChangeSearch: (value: ChangeEvent<HTMLInputElement>) => void,
  selectedFieldType: EuiComboBoxOptionOption<String>[],
  onChangeFieldType: (options: EuiComboBoxOptionOption<String>[]) => void,
  selection: EuiTableSelectionType<ManagedCatIndex>
) => (
  <EuiForm title={"Add fields"}>
    <EuiFlexGroup>
      <EuiFlexItem grow={2}>
        <EuiFieldSearch placeholder="Search field name" value={searchText} onChange={onChangeSearch} isClearable={true} />
      </EuiFlexItem>
      <EuiFlexItem grow={1}>
        <EuiComboBox
          placeholder="Field type"
          options={tempFieldTypeOptions}
          selectedOptions={selectedFieldType}
          onChange={onChangeFieldType}
          isClearable={true}
          singleSelection={true}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
    {/*TODO: create fake list of items, and figure out how to retrieve the selections for table*/}
    <EuiBasicTable
      items={[]}
      rowHeader="fieldName"
      columns={addFieldsColumns}
      noItemsMessage="No field added for aggregation"
      isSelectable={true}
      selection={selection}
    />
  </EuiForm>
);
const sampleMetricItems: MetricItem[] = [
  {
    fieldname: "On time rate",
    all: true,
    min: false,
    max: true,
    sum: false,
    avg: false,
    value_count: false,
  },
  {
    fieldname: "Return rate",
    all: true,
    min: true,
    max: false,
    sum: false,
    avg: false,
    value_count: false,
  },
  {
    fieldname: "OTIF rate",
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
    field: "fieldname",
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

const addFieldsColumns = [
  {
    field: "fieldname",
    name: "Field name",
    sortable: true,
  },
  {
    field: "fieldType",
    name: "Field type",
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

  onSelectionChange = (selectedFields: ManagedCatIndex[]): void => {
    this.setState({ selectedFields });
  };

  render() {
    const { isModalVisible, searchText, selectedFieldType } = this.state;
    const selection: EuiTableSelectionType<ManagedCatIndex> = {
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
            noItemsMessage="No field added for metrics calculation"
            tableLayout={"auto"}
          />
          <EuiSpacer size="s" />
          {isModalVisible && (
            <EuiOverlayMask>
              <EuiModal onClose={this.closeModal} maxWidth={700}>
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
                      items={[]}
                      rowHeader="fieldName"
                      columns={addFieldsColumns}
                      noItemsMessage="No field added for aggregation"
                      isSelectable={true}
                      selection={selection}
                      tableLayout={"auto"}
                    />
                  </EuiForm>
                </EuiModalBody>

                <EuiModalFooter>
                  <EuiButtonEmpty onClick={this.closeModal}>Cancel</EuiButtonEmpty>

                  <EuiButton onClick={this.closeModal}>Save</EuiButton>
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}
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
        </div>
      </ContentPanel>
    );
  }
}
