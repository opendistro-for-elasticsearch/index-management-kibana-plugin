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
  EuiTableFieldDataColumnType,
  EuiFormRow,
  EuiSelect,
  EuiText,
  EuiLink,
  EuiIcon,
  EuiPanel,
  EuiTitle,
  EuiFormHelpText,
  EuiHorizontalRule,
  EuiCallOut,
  EuiFieldNumber,
} from "@elastic/eui";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";
import { DimensionItem, FieldItem } from "../../models/interfaces";
import { AddFieldsColumns } from "../../utils/constants";
import { RollupItem } from "../../../Rollups/models/interfaces";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { Criteria } from "@elastic/eui/src/components/basic_table/basic_table";

interface AdvancedAggregationProps {
  fieldsOption: FieldItem[];
  // selectedFields: FieldItem [];
  onDimensionSelectionChange: (selectedFields: DimensionItem[]) => void;
  selectedDimensionField: DimensionItem[];
}

interface AdvancedAggregationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
  selectedFields: FieldItem[];
  from: number;
  size: number;
  sortField: string;
  sortDirection: string;
}

const fieldTypeOption = [
  { label: "string", value: "string" },
  { label: "number", value: "number" },
];

export default class AdvancedAggregation extends Component<AdvancedAggregationProps, AdvancedAggregationState> {
  constructor(props: AdvancedAggregationProps) {
    super(props);

    this.state = {
      isModalVisible: false,
      searchText: "",
      selectedFieldType: [],
      from: 0,
      size: 10,
      sortField: "sequence",
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

  onSelectionChange = (selectedFields: FieldItem[]): void => {
    this.setState({ selectedFields });
  };

  //TODO: Save the fields to selectedDimensionsField as DimensionItem, and perhaps only update the ones changed instead of recreating every time.
  onClickAdd() {
    const { onDimensionSelectionChange, selectedDimensionField } = this.props;
    const { selectedFields } = this.state;
    //Clone selectedDimensionField
    const toAddFields = Array.from(selectedFields);
    // Loop through selectedFields to see if existing Dimensions are removed

    let updatedDimensions = selectedDimensionField.map((dimension) => {
      //If does not exist in new selection, remove this dimension.
      if (!selectedFields.includes(dimension.field)) {
        console.log("Delete: " + dimension.field.label);
      }
      //If exists, delete it from toAddFields so that it doesn't get added again.
      else {
        const index = toAddFields.indexOf(dimension.field);
        toAddFields.splice(index, 1);
        console.log(dimension.field.label + " exists.");
        return dimension;
      }
    });
    //Update sequence number
    this.updateSequence(updatedDimensions);
    //Parse selectedFields to an array of DimensionItem if it does not exist
    let i: number = updatedDimensions.length + 1;
    const toAdd: DimensionItem[] = toAddFields.map((field) => {
      console.log("Add: " + field.label);
      return field.type == "long" || field.type == "double"
        ? {
            sequence: i++,
            field: field,
            aggregationMethod: "histogram",
            interval: 5,
          }
        : {
            sequence: i++,
            field: field,
            aggregationMethod: "term",
          };
    });
    onDimensionSelectionChange(updatedDimensions.concat(toAdd));
    console.log(this.props.selectedDimensionField);
  }

  moveUp() {}

  moveDown() {}

  deleteField() {}

  swap() {}
  onChangeInterval = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({});
  };

  //Check the dimension num
  updateSequence(items: DimensionItem[]) {
    const { onDimensionSelectionChange } = this.props;
    let dimensionNum;
    for (dimensionNum = 0; dimensionNum < items.length; dimensionNum++) {
      items[dimensionNum].sequence = dimensionNum + 1;
    }
    console.log(items);
    onDimensionSelectionChange(items);
  }

  // onTableChange = ({ page: tablePage, sort }: Criteria<DimensionItem>): void => {
  //   const { index: page, size } = tablePage;
  //   const { field: sortField, direction: sortDirection } = sort;
  //   this.setState({ from: page * size, size, sortField, sortDirection });
  // };
  render() {
    const { fieldsOption, selectedDimensionField, onDimensionSelectionChange } = this.props;
    const { selectedFields, isModalVisible, searchText, selectedFieldType, page, size, sortDirection, sortField } = this.state;
    // const pagination: Pagination = {
    //   pageIndex: page,
    //   pageSize: size,
    //   pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
    //   totalItemCount: fieldsOption.length,
    // };

    // const sorting: EuiTableSortingType<{ label: string; value?: FieldItem }> = {
    //   sort: {
    //     direction: sortDirection,
    //     field: sortField,
    //   },
    // };

    //TODO: make selection working, currently limiting selection to certain tyoe
    const selection: EuiTableSelectionType<FieldItem> = {
      onSelectionChange: this.onSelectionChange,
      initialSelected: selectedFields,
    };

    const aggregationColumns: EuiTableFieldDataColumnType<DimensionItem>[] = [
      {
        field: "sequence",
        name: "Sequence",
        sortable: true,
        dataType: "number",
        align: "left",
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
        render: (aggregationMethod) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiSelect
                compressed={true}
                value={aggregationMethod}
                disabled={aggregationMethod == "term"}
                options={[
                  { value: "term", text: "Term" },
                  { value: "histogram", text: "Histogram" },
                ]}
              />
            </EuiFormRow>
          </EuiForm>
        ),
      },
      {
        field: "interval",
        name: "Interval",
        dataType: "number",
        align: "left",
        render: (interval: null | number) =>
          interval == null ? (
            "-"
          ) : (
            <EuiForm>
              <EuiFormRow>
                <EuiFieldNumber min={1} value={interval} onChange={this.onChangeInterval} />
              </EuiFormRow>
            </EuiForm>
          ),
      },
      {
        field: "actions",
        name: "Actions",
        //TODO: Disable button for first and last row
        render: (sequence) => (
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiLink onClick={this.moveDown} disabled={sequence == 1}>
                Move down
              </EuiLink>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiLink onClick={this.moveUp} disabled={sequence == selectedDimensionField.length}>
                Move up
              </EuiLink>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiIcon type={"crossInACircleFilled"} onClick={this.deleteField}></EuiIcon>
            </EuiFlexItem>
          </EuiFlexGroup>
        ),
      },
    ];

    return (
      <EuiPanel>
        <EuiFlexGroup style={{ padding: "5px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexGroup gutterSize={"xs"} direction={"column"} justifyContent="spaceAround" style={{ padding: "0px 10px" }}>
            <EuiFlexItem>
              <EuiFlexGroup gutterSize={"xs"}>
                <EuiFlexItem grow={false}>
                  <EuiTitle size={"m"}>
                    <h3>Additional aggregation </h3>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiTitle size={"m"}>
                    <i>{" - optional "}</i>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText size={"m"} color={"subdued"}>
                    <h2>{` (${selectedDimensionField.length})`}</h2>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormHelpText>
                You can aggregate additional fields from the source index into the target index. Rollup supports the terms aggregation (for
                all field types) and histogram aggregation (for numeric fields).
              </EuiFormHelpText>
            </EuiFlexItem>
            {selectedDimensionField.length != 0 && (
              <Fragment>
                <EuiFlexItem>
                  <EuiCallOut>
                    <p>
                      The order of fields impacts rollup performance. Aggregating by smaller buckets and then by larger buckets is faster
                      than the opposite. For example, if you are rolling up flight data for five airlines with 100 destinations, aggregating
                      by airline and then by destination is faster than aggregating by destination first.
                    </p>
                  </EuiCallOut>
                  <EuiSpacer size={"s"} />
                </EuiFlexItem>
              </Fragment>
            )}
          </EuiFlexGroup>

          <EuiFlexItem grow={false}>
            <EuiButton onClick={this.showModal}>Add fields</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size={"s"} />
        <EuiHorizontalRule margin="xs" />
        <div style={{ paddingLeft: "10px" }}>
          {/*Need to create array of dimension items after selection*/}
          <EuiBasicTable
            items={selectedDimensionField}
            rowHeader={"fieldName"}
            columns={aggregationColumns}
            tableLayout={"auto"}
            hasActions={true}
            // onChange={this.onTableChange}
            noItemsMessage={
              <Fragment>
                <EuiSpacer />
                <EuiText>No fields added for aggregations</EuiText>
                <EuiSpacer />
                <EuiFlexGroup style={{ padding: "5px 10px" }} alignItems="center">
                  <EuiFlexItem>
                    <EuiSpacer />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton onClick={this.showModal}>Add fields</EuiButton>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiSpacer size={"m"} />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </Fragment>
            }
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
                          placeholder={"Search field name"}
                          value={searchText}
                          onChange={this.onChangeSearch}
                          isClearable={true}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={1}>
                        <EuiComboBox
                          placeholder={"Field type"}
                          options={fieldTypeOption}
                          selectedOptions={selectedFieldType}
                          onChange={this.onChangeFieldType}
                          isClearable={true}
                          singleSelection={true}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiBasicTable
                      columns={AddFieldsColumns}
                      items={fieldsOption}
                      itemId={"label"}
                      rowHeader={"fieldName"}
                      noItemsMessage={"No fields available"}
                      isSelectable={true}
                      selection={selection}
                      tableLayout={"fixed"}
                      // onChange={this.onTableChange}
                      // pagination={pagination}
                      // sorting={sorting}
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
