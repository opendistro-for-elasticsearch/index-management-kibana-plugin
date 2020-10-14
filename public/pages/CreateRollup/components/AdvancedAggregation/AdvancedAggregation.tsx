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

import React, { ChangeEvent, Component } from "react";
import {
  EuiSpacer,
  EuiBasicTable,
  EuiButton,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFieldSearch,
  EuiComboBox,
  EuiComboBoxOptionOption,
  // @ts-ignore
  Pagination,
  EuiTableSortingType,
  EuiTableSelectionType,
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { DimensionItem, FieldItem } from "../../../../../models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";

interface AdvancedAggregationProps {
  fieldsOption: { label: string; value?: FieldItem }[];
  // selectedFields: { label: string; value?: FieldItem }[];
  onDimensionSelectionChange: (selectedFields: DimensionItem[]) => void;
  selectedDimensionField: DimensionItem[];
}

interface AdvancedAggregationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
  selectedFields: { label: string; value?: FieldItem }[];
  page: number;
  size: number;
  sortField: string;
  sortDirection: string;
}

const fieldTypeOption = [
  { label: "string", value: "string" },
  { label: "number", value: "number" },
];

const aggregationColumns = [
  {
    field: "sequence",
    name: "Sequence",
    sortable: true,
  },
  {
    field: "fieldname",
    name: "Field Name",
  },
  {
    field: "fieldType",
    name: "Field Type",
    truncateText: true,
  },
  {
    field: "aggregationMethod",
    name: "Aggregation method",
  },
  {
    field: "interval",
    name: "Interval",
  },
  {
    field: "actions",
    name: "Actions",
  },
];

const addFieldsColumns = [
  {
    field: "label",
    name: "Field name",
    sortable: true,
  },
  {
    field: "value.type",
    name: "Field type",
    sortable: true,
  },
];

export default class AdvancedAggregation extends Component<AdvancedAggregationProps, AdvancedAggregationState> {
  constructor(props: AdvancedAggregationProps) {
    super(props);

    this.state = {
      isModalVisible: false,
      searchText: "",
      selectedFieldType: [],
      page: 1,
      size: 10,
      sortField: "label",
      sortDirection: "desc",
      selectedFields: [],
    };
  }

  closeModal = () => this.setState({ isModalVisible: false });

  showModal = () => this.setState({ isModalVisible: true });

  onChangeSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ searchText: e.target.value });
    console.log(this.state);
  };

  onChangeFieldType = (options: EuiComboBoxOptionOption<String>[]): void => {
    this.setState({ selectedFieldType: options });
  };

  onSelectionChange = (selectedFields: { label: string; value?: FieldItem }[]): void => {
    console.log("We are inside onSelectionChange");
    this.setState({ selectedFields });
  };

  //TODO: Save the fields to selectedDimensionsField as DimensionItem
  onClickSave() {}

  // onTableChange = ({ page: tablePage , sort)}: Criteria<{ label: string; value?: FieldItem }>) => {
  //   const { index: page, size} = tablePage;
  //
  //   const { field: sortField, direction: sortDirection } = sort;
  //   this.setState({page, size:pageSize , sortField,sortDirection})
  // };

  render() {
    const { fieldsOption, selectedDimensionField, onDimensionSelectionChange } = this.props;
    const { isModalVisible, searchText, selectedFieldType, page, size, sortDirection, sortField } = this.state;
    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: fieldsOption.length,
    };

    const sorting: EuiTableSortingType<{ label: string; value?: FieldItem }> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<{ label: string; value?: FieldItem }> = {
      onSelectionChange: this.onSelectionChange,
    };

    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {() => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Add field",
                    buttonProps: {
                      onClick: () => this.showModal(),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title="Additional aggregations - optional"
        titleSize="m"
      >
        <div style={{ paddingLeft: "10px" }}>
          {/*Need to create array of dimension items after selection*/}
          <EuiBasicTable
            items={selectedDimensionField}
            rowHeader="fieldName"
            columns={aggregationColumns}
            noItemsMessage="No field added for aggregation"
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
                          options={fieldTypeOption}
                          selectedOptions={selectedFieldType}
                          onChange={this.onChangeFieldType}
                          isClearable={true}
                          singleSelection={true}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiBasicTable
                      columns={addFieldsColumns}
                      items={fieldsOption}
                      rowHeader="fieldName"
                      noItemsMessage="No fields available"
                      isSelectable={true}
                      selection={selection}
                      // onChange={this.onTableChange}
                      // pagination={pagination}
                      // sorting={sorting}
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
