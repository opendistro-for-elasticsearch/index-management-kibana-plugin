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
} from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { FieldItem } from "../../../../../models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";

interface AdvancedAggregationProps {
  fieldsOption: { label: string; value?: FieldItem }[];
  // selectedFields: { label: string; value?: FieldItem }[];
  onDimensionSelectionChange: (selectedFields: { label: string; value?: FieldItem }[]) => void;
  selectedDimensionField: { label: string; value?: FieldItem }[];
}

interface AdvancedAggregationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
  page: number;
  size: number;
  sortField: string;
  sortDirection: string;
}
const fieldTypeOption = [
  { label: "string", value: "string" },
  { label: "number", value: "number" },
];

const addFields = (
  searchText: string,
  onChangeSearch: (value: ChangeEvent<HTMLInputElement>) => void,
  selectedFieldType: EuiComboBoxOptionOption<String>[],
  onChangeFieldType: (options: EuiComboBoxOptionOption<String>[]) => void,
  onDimensionSelectionChange: (selectedFields: { label: string; value?: FieldItem }[]) => void,
  selectedDimensionField: { label: string; value?: FieldItem }[],
  fieldsOption: { label: string; value?: FieldItem }[]
  // fieldTypeOption: {label: string, value?: string}[]
) => (
  <EuiForm title={"Add fields"}>
    <EuiFlexGroup>
      <EuiFlexItem grow={2}>
        <EuiFieldSearch placeholder="Search field name" value={searchText} onChange={onChangeSearch} isClearable={true} />
      </EuiFlexItem>
      <EuiFlexItem grow={1}>
        <EuiComboBox
          placeholder="Field type"
          options={fieldTypeOption}
          selectedOptions={selectedFieldType}
          onChange={onChangeFieldType}
          isClearable={true}
          singleSelection={true}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiBasicTable
      items={fieldsOption}
      rowHeader="fieldName"
      columns={addFieldsColumns}
      noItemsMessage="No field added for aggregation"
      isSelectable={true}
      selection={selectedDimensionField}
      // onTableChange={}
    />
  </EuiForm>
);

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
  //
  // onSelectionChange = (selectedFields: { label: string, value?: FieldItem }[]): void => {
  //   this.setState({ selectedFields });
  // };

  // onTableChange = ({ page = {}, sort = {} }) => {
  //   const { index: pageIndex, size: pageSize } = page;
  //
  //   const { field: sortField, direction: sortDirection } = sort;
  //   this.setState({page, size, sortField,sortDirection})
  // };

  render() {
    const { fieldsOption, selectedDimensionField, onDimensionSelectionChange } = this.props;
    const { isModalVisible, searchText, selectedFieldType, page, size, sortDirection, sortField } = this.state;
    // @ts-ignore
    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: selectedDimensionField.length,
    };

    const sorting: EuiTableSortingType<FieldItem> = {
      sort: {
        direction: sortDirection,
        field: sortField,
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
            items={[]}
            rowHeader="fieldName"
            columns={aggregationColumns}
            noItemsMessage="No field added for aggregation"
            tableLayout={"auto"}
            // pagination={pagination}
            // sorting={sorting}
          />
          <EuiSpacer size="s" />
          {isModalVisible && (
            <EuiOverlayMask>
              <EuiModal onClose={this.closeModal} maxWidth={700}>
                <EuiModalHeader>
                  <EuiModalHeaderTitle>Add fields</EuiModalHeaderTitle>
                </EuiModalHeader>

                <EuiModalBody>
                  {addFields(
                    searchText,
                    this.onChangeSearch,
                    selectedFieldType,
                    this.onChangeFieldType,
                    onDimensionSelectionChange,
                    selectedDimensionField,
                    fieldsOption
                  )}
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
