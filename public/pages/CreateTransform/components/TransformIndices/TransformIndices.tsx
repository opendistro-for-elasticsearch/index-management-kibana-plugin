/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { Component, Fragment } from "react";
import { EuiSpacer, EuiFormRow, EuiComboBox, EuiCallOut, EuiFacetButton, EuiAvatar, EuiPopover } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import IndexFilterPopover from "../IndexFilterPopover";
import { EuiComboBoxOptionOption } from "@elastic/eui/src/components/combo_box/types";
import { IndexItem } from "../../../../../models/interfaces";
import IndexService from "../../../../services/IndexService";
import _ from "lodash";
import { CoreServicesContext } from "../../../../components/core_services";

interface TransformIndicesProps {
  indexService: IndexService;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;
  onChangeSourceIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  onChangeTargetIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  hasAggregation: boolean;
}

interface TransformIndicesState {
  isLoading: boolean;
  indexOptions: { label: string; value?: IndexItem }[];
  targetIndexOptions: { label: string; value?: IndexItem }[];
  isPopoverOpen: boolean;
  selectFieldValue: string;
}

export default class TransformIndices extends Component<TransformIndicesProps, TransformIndicesState> {
  static contextType = CoreServicesContext;
  constructor(props: TransformIndicesProps) {
    super(props);
    this.state = {
      isLoading: true,
      indexOptions: [],
      targetIndexOptions: [],
      isPopoverOpen: false,
      selectFieldValue: "",
    };

    this.onIndexSearchChange = _.debounce(this.onIndexSearchChange, 500, { leading: true });
  }

  async componentDidMount(): Promise<void> {
    await this.onIndexSearchChange("");
  }

  onIndexSearchChange = async (searchValue: string): Promise<void> => {
    const { indexService } = this.props;
    this.setState({ isLoading: true, indexOptions: [] });
    try {
      const queryObject = { from: 0, size: 10, search: searchValue, sortDirection: "desc", sortField: "index" };
      const getIndicesResponse = await indexService.getIndices(queryObject);
      if (getIndicesResponse.ok) {
        const options = searchValue.trim() ? [{ label: `${searchValue}*` }] : [];
        const indices = getIndicesResponse.response.indices.map((index: IndexItem) => ({
          label: index.index,
        }));
        this.setState({ indexOptions: options.concat(indices), targetIndexOptions: indices });
      } else {
        if (getIndicesResponse.error.startsWith("[index_not_found_exception]")) {
          this.context.notifications.toasts.addDanger("No index available");
        } else {
          this.context.notifications.toasts.addDanger(getIndicesResponse.error);
        }
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(err.message);
    }

    this.setState({ isLoading: false });
  };

  onCreateOption = (searchValue: string, flattenedOptions: { label: string; value?: IndexItem }[]): void => {
    const { targetIndexOptions } = this.state;
    const { onChangeTargetIndex } = this.props;
    const normalizedSearchValue = searchValue.trim();

    if (!normalizedSearchValue) {
      return;
    }

    const newOption = {
      label: searchValue,
    };

    // Create the option if it doesn't exist.
    if (flattenedOptions.findIndex((option) => option.label.trim() === normalizedSearchValue) === -1) {
      targetIndexOptions.concat(newOption);
      this.setState({ targetIndexOptions: targetIndexOptions });
    }
    onChangeTargetIndex([newOption]);
  };

  onButtonClick = () => {
    const { isPopoverOpen } = this.state;
    if (isPopoverOpen) {
      this.setState({ isPopoverOpen: false });
    } else {
      this.setState({ isPopoverOpen: true });
    }
  };

  closePopover = () => this.setState({ isPopoverOpen: false });

  render() {
    const {
      sourceIndex,
      sourceIndexError,
      targetIndex,
      targetIndexError,
      onChangeSourceIndex,
      onChangeTargetIndex,
      hasAggregation,
    } = this.props;

    const { isLoading, indexOptions, targetIndexOptions, isPopoverOpen } = this.state;

    const filterButton = (
      <EuiFacetButton
        icon={<EuiAvatar size="s" name="Place Holder" />} // Should be filter icon per design doc
        onClick={this.onButtonClick}
      >
        + Add data filter
      </EuiFacetButton>
    );

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Indices" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiCallOut color="warning">
            <p>You can't change indices after creating a job. Double-check the source and target index names before proceeding.</p>
          </EuiCallOut>
          {hasAggregation && (
            <Fragment>
              <EuiSpacer />
              <EuiCallOut color="warning">
                <p>Note: changing source index will erase all existing definitions about aggregations and metrics.</p>
              </EuiCallOut>
            </Fragment>
          )}
          <EuiSpacer size="m" />
          <EuiFormRow
            label="Source index"
            error={sourceIndexError}
            isInvalid={sourceIndexError != ""}
            helpText="The index where this transform job is performed on. Type in * as wildcard for index pattern. \
            Indices cannot be changed once the job is created. Please ensure that you select the right source index."
          >
            <EuiComboBox
              placeholder="Select source index"
              options={indexOptions}
              selectedOptions={sourceIndex}
              onChange={onChangeSourceIndex}
              singleSelection={{ asPlainText: true }}
              onSearchChange={this.onIndexSearchChange}
              isLoading={isLoading}
              isInvalid={sourceIndexError != ""}
              data-test-subj="sourceIndexCombobox"
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFormRow
            label="Source index filter"
            error={sourceIndexError}
            isInvalid={sourceIndexError != ""}
            helpText="Choose a subset of source index to focus on to optimize for performance and computing resource. You can't change filter once the job is created"
          >
            <EuiPopover button={filterButton} isOpen={isPopoverOpen} closePopover={this.closePopover}>
              <IndexFilterPopover {...this.props} />
            </EuiPopover>
          </EuiFormRow>

          <EuiFormRow
            label="Target index"
            error={targetIndexError}
            isInvalid={targetIndexError != ""}
            helpText="The index stores transform results. You can look up an existing index to reuse or type to create a new index."
          >
            <EuiComboBox
              placeholder="Select or create target index"
              options={targetIndexOptions}
              selectedOptions={targetIndex}
              onChange={onChangeTargetIndex}
              onCreateOption={this.onCreateOption}
              singleSelection={{ asPlainText: true }}
              onSearchChange={this.onIndexSearchChange}
              isLoading={isLoading}
              isInvalid={targetIndexError != ""}
              data-test-subj="targetIndexCombobox"
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
