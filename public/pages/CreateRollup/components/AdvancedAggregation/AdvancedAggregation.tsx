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
  EuiFormRow,
  EuiFieldSearch,
  EuiComboBox,
  EuiComboBoxOptionOption,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface AdvancedAggregationProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface AdvancedAggregationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
}

const tempFieldTypeOptions = [{ label: "string" }, { label: "location" }, { label: "number" }, { label: "timestamp" }];

const addFields = (
  searchText: string,
  onChangeSearch: (value: ChangeEvent<HTMLInputElement>) => void,
  selectedFieldType: EuiComboBoxOptionOption<String>[],
  onChangeFieldType: (options: EuiComboBoxOptionOption<String>[]) => void
) => (
  <EuiForm title={"Add fields"}>
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiFieldSearch placeholder="Search field name" value={searchText} onChange={onChangeSearch} isClearable={true} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
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
  </EuiForm>
);

const columns = [
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

export default class AdvancedAggregation extends Component<AdvancedAggregationProps, AdvancedAggregationState> {
  constructor(props: AdvancedAggregationProps) {
    super(props);

    this.state = {
      isModalVisible: false,
      searchText: "",
      selectedFieldType: [],
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

  render() {
    const { isModalVisible, searchText, selectedFieldType } = this.state;

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Advanced aggregation - optional" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiBasicTable items={[]} rowHeader="fieldName" columns={columns} noItemsMessage="No field added for aggregation" />
          <EuiSpacer size="s" />
          {isModalVisible && (
            <EuiOverlayMask>
              <EuiModal onClose={this.closeModal} maxWidth={800}>
                <EuiModalHeader>
                  <EuiModalHeaderTitle>Add fields</EuiModalHeaderTitle>
                </EuiModalHeader>

                <EuiModalBody>{addFields(searchText, this.onChangeSearch, selectedFieldType, this.onChangeFieldType)}</EuiModalBody>

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
