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
  // @ts-ignore
  CustomItemAction,
  // @ts-ignore
  Criteria,
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
  EuiTableSortingType,
} from "@elastic/eui";
import { DimensionItem, FieldItem } from "../../models/interfaces";
import { AddFieldsColumns } from "../../utils/constants";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";
import _ from "lodash";
import { isNumericMapping } from "../../utils/helpers";

interface AdvancedAggregationProps {
  fieldsOption: FieldItem[];
  onDimensionSelectionChange: (selectedFields: DimensionItem[]) => void;
  selectedDimensionField: DimensionItem[];
}

interface AdvancedAggregationState {
  isModalVisible: boolean;
  searchText: string;
  selectedFieldType: EuiComboBoxOptionOption<String>[];
  selectedFields: FieldItem[];
  allSelectedFields: FieldItem[];
  fieldsShown: FieldItem[];
  dimensionsShown: DimensionItem[];
  dimension_from: number;
  dimension_size: number;
  dimension_sortField: string;
  dimension_sortDirection: string;
}

const fieldTypeOption = [
  { label: "string", value: "string" },
  { label: "number", value: "number" },
];

export default class AdvancedAggregation extends Component<AdvancedAggregationProps, AdvancedAggregationState> {
  constructor(props: AdvancedAggregationProps) {
    super(props);
    const { selectedDimensionField, fieldsOption } = this.props;
    this.state = {
      isModalVisible: false,
      searchText: "",
      selectedFieldType: [],
      allSelectedFields: [],
      fieldsShown: fieldsOption.slice(0, 10),
      dimensionsShown: selectedDimensionField.slice(0, 10),
      selectedFields: [],
      dimension_from: 0,
      dimension_size: 10,
      dimension_sortField: "sequence",
      dimension_sortDirection: "desc",
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
    const { onDimensionSelectionChange, selectedDimensionField } = this.props;
    const { selectedFields, allSelectedFields, dimension_from, dimension_size } = this.state;
    //Clone selectedDimensionField
    let updatedDimensions = Array.from(selectedDimensionField);
    const toAddFields = Array.from(selectedFields);

    selectedDimensionField.map((dimension) => {
      if (allSelectedFields.includes(dimension.field)) {
        console.log("Duplicate found: " + dimension.field);
        const index = toAddFields.indexOf(dimension.field);
        toAddFields.splice(index, 1);
      }
    });
    //Update sequence number
    this.updateSequence(updatedDimensions);
    //Parse selectedFields to an array of DimensionItem if any of the field does not exist
    let i = updatedDimensions.length + 1;
    const toAdd: DimensionItem[] = toAddFields.map((field) => {
      return isNumericMapping(field.type)
        ? {
            sequence: i++,
            field: field,
            aggregationMethod: "histogram",
            interval: 5,
          }
        : {
            sequence: i++,
            field: field,
            aggregationMethod: "terms",
          };
    });
    const result = updatedDimensions.length ? updatedDimensions.concat(toAdd) : toAdd;
    onDimensionSelectionChange(result);
    this.setState({ allSelectedFields: allSelectedFields.concat(toAddFields) });
    this.setState({ dimensionsShown: result.slice(dimension_from, dimension_from + dimension_size) });
    this.forceUpdate();
  }

  //Check the dimension num
  updateSequence(items: DimensionItem[]) {
    if (items.length == 0) return;
    const { onDimensionSelectionChange } = this.props;
    const { dimension_size, dimension_from } = this.state;
    let dimensionNum;
    for (dimensionNum = 0; dimensionNum < items.length; dimensionNum++) {
      items[dimensionNum].sequence = dimensionNum + 1;
    }
    onDimensionSelectionChange(items);
    this.setState({ dimensionsShown: items.slice(dimension_from, dimension_from + dimension_size) });
  }

  moveUp(item: DimensionItem) {
    const { selectedDimensionField } = this.props;
    const toMoveindex = selectedDimensionField.indexOf(item);
    if (toMoveindex == 0) return;
    let toSwap = selectedDimensionField[toMoveindex - 1];
    selectedDimensionField[toMoveindex] = toSwap;
    selectedDimensionField[toMoveindex - 1] = item;
    this.updateSequence(selectedDimensionField);
  }

  moveDown(item: DimensionItem) {
    const { selectedDimensionField } = this.props;
    const toMoveindex = selectedDimensionField.indexOf(item);
    if (toMoveindex == selectedDimensionField.length - 1) return;
    let toSwap = selectedDimensionField[toMoveindex + 1];
    selectedDimensionField[toMoveindex] = toSwap;
    selectedDimensionField[toMoveindex + 1] = item;
    this.updateSequence(selectedDimensionField);
  }

  deleteField = (item: DimensionItem) => {
    const { selectedDimensionField } = this.props;
    const { selectedFields, allSelectedFields } = this.state;

    //Remove the dimension item and then update sequence.
    selectedDimensionField.splice(selectedDimensionField.indexOf(item), 1);
    selectedFields.splice(selectedFields.indexOf(item.field), 1);
    allSelectedFields.splice(allSelectedFields.indexOf(item.field), 1);
    this.setState({ selectedFields, allSelectedFields });
    this.updateSequence(selectedDimensionField);
  };

  onChangeInterval = (e: ChangeEvent<HTMLInputElement>, item: DimensionItem): void => {
    const { selectedDimensionField, onDimensionSelectionChange } = this.props;
    const index = selectedDimensionField.indexOf(item);
    const newItem: DimensionItem = {
      sequence: item.sequence,
      field: item.field,
      aggregationMethod: e.target.value,
      interval: e.target.valueAsNumber,
    };
    selectedDimensionField[index] = newItem;
    onDimensionSelectionChange(selectedDimensionField);
  };

  onChangeAggregationMethod = (e: ChangeEvent<HTMLSelectElement>, item: DimensionItem): void => {
    const { selectedDimensionField, onDimensionSelectionChange } = this.props;
    const index = selectedDimensionField.indexOf(item);
    const newItem: DimensionItem = {
      sequence: item.sequence,
      field: item.field,
      aggregationMethod: e.target.value,
    };
    if (e.target.value == "histogram") {
      newItem.interval = 5;
    }
    selectedDimensionField[index] = newItem;
    onDimensionSelectionChange(selectedDimensionField);
  };

  onDimensionTableChange = ({ page: tablePage, sort }: Criteria<DimensionItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    const { selectedDimensionField } = this.props;
    this.setState({
      dimension_from: page * size,
      dimension_size: size,
      dimension_sortField: sortField,
      dimension_sortDirection: sortDirection,
      dimensionsShown: selectedDimensionField.slice(page * size, page * size + size),
    });
  };

  render() {
    const { fieldsOption, selectedDimensionField } = this.props;
    const {
      allSelectedFields,
      isModalVisible,
      searchText,
      selectedFieldType,
      dimension_from,
      dimension_size,
      dimension_sortDirection,
      dimension_sortField,
      dimensionsShown,
    } = this.state;
    const dimension_page = Math.floor(dimension_from / dimension_size);

    const dimension_pagination: Pagination = {
      pageIndex: dimension_page,
      pageSize: dimension_size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: selectedDimensionField.length,
    };

    const dimension_sorting: EuiTableSortingType<DimensionItem> = {
      sort: {
        direction: dimension_sortDirection,
        field: dimension_sortField,
      },
    };

    const selection: EuiTableSelectionType<FieldItem> = {
      selectable: (field) => !allSelectedFields.includes(field),
      onSelectionChange: this.onSelectionChange,
    };

    const actions = [
      {
        name: "move",
        color: "primary",
        isPrimary: true,
        render: (item: DimensionItem) => {
          return (
            <EuiFlexGroup>
              {item.sequence != 1 && (
                <EuiFlexItem grow={false}>
                  <EuiLink color={"primary"} onClick={() => this.moveUp(item)} disabled={item.sequence == 1}>
                    Move up
                  </EuiLink>
                </EuiFlexItem>
              )}
              {item.sequence != selectedDimensionField.length && (
                <EuiFlexItem grow={false}>
                  <EuiLink color={"primary"} onClick={() => this.moveDown(item)} disabled={item.sequence == selectedDimensionField.length}>
                    Move down
                  </EuiLink>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          );
        },
      },
      {
        render: (item: DimensionItem) => {
          return <EuiIcon type={"crossInACircleFilled"} onClick={() => this.deleteField(item)} />;
        },
      },
    ];

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
        render: (aggregationMethod, item) => (
          <EuiForm>
            <EuiFormRow compressed={true}>
              <EuiSelect
                compressed={true}
                value={aggregationMethod}
                disabled={
                  !(
                    item.field.type == "long" ||
                    item.field.type == "double" ||
                    item.field.type == "float" ||
                    item.field.type == "integer" ||
                    item.field.type == "number"
                  )
                }
                options={[
                  { value: "terms", text: "Terms" },
                  { value: "histogram", text: "Histogram" },
                ]}
                onChange={(e) => this.onChangeAggregationMethod(e, item)}
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
        render: (interval: number, item) =>
          interval == null ? (
            "-"
          ) : (
            <EuiForm>
              <EuiFormRow>
                <EuiFieldNumber min={1} value={interval} onChange={(e) => this.onChangeInterval(e, item)} />
              </EuiFormRow>
            </EuiForm>
          ),
      },
      {
        name: "Actions",
        actions: actions,
      },
    ];

    return (
      <EuiPanel>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiFlexGroup gutterSize={"xs"} direction={"column"} justifyContent="spaceAround" style={{ padding: "5px 10px" }}>
              <EuiFlexItem>
                <EuiFlexGroup gutterSize={"xs"}>
                  <EuiFlexItem grow={false}>
                    <EuiTitle size={"m"}>
                      <h3>Additional aggregation </h3>
                    </EuiTitle>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size={"m"} color={"subdued"}>
                      <h2>{` (${selectedDimensionField.length})`}</h2>
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiTitle size={"m"}>
                      <i>{" - optional "}</i>
                    </EuiTitle>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormHelpText>
                  You can aggregate additional fields from the source index into the target index. Rollup supports the terms aggregation
                  (for all field types) and histogram aggregation (for numeric fields).
                </EuiFormHelpText>
              </EuiFlexItem>
              {selectedDimensionField.length != 0 && (
                <Fragment>
                  <EuiFlexItem>
                    <EuiCallOut>
                      <p>
                        The order of fields impacts rollup performance. Aggregating by smaller buckets and then by larger buckets is faster
                        than the opposite. For example, if you are rolling up flight data for five airlines with 100 destinations,
                        aggregating by airline and then by destination is faster than aggregating by destination first.
                      </p>
                    </EuiCallOut>
                    <EuiSpacer size={"s"} />
                  </EuiFlexItem>
                </Fragment>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize={"l"} direction={"column"} justifyContent="spaceBetween" style={{ padding: "0px 10px" }}>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.showModal}>Add fields</EuiButton>
              </EuiFlexItem>
              <EuiFlexItem>{""}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size={"s"} />
        <EuiHorizontalRule margin="xs" />
        <div style={{ paddingLeft: "10px" }}>
          <EuiBasicTable
            items={dimensionsShown}
            itemId={"sequence"}
            columns={aggregationColumns}
            tableLayout={"auto"}
            hasActions={true}
            onChange={this.onDimensionTableChange}
            pagination={dimension_pagination}
            sorting={dimension_sorting}
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
                    <EuiBasicTable
                      columns={AddFieldsColumns}
                      items={fieldsOption}
                      itemId={"label"}
                      rowHeader={"fieldName"}
                      noItemsMessage={"No fields available"}
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
