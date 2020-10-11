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

import React, { Component } from "react";
import { EuiSpacer, EuiFormRow, EuiComboBox, EuiCallOut } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { EuiComboBoxOptionOption } from "@elastic/eui/src/components/combo_box/types";
import { IndexOption } from "../../models/interfaces";
import { Policy } from "../../../../../models/interfaces";
import { toastNotifications } from "ui/notify";
import IndexService from "../../../../services/IndexService";

interface RollupIndicesProps {
  indexService: IndexService;
  sourceIndex: IndexOption;
  targetIndex: IndexOption;
  onChange: (options: EuiComboBoxOptionOption<ManagedCatIndex>[]) => void;
  onCreateIndex: (searchValue: string, options: EuiComboBoxOptionOption<ManagedCatIndex>[]) => boolean | void;
}

interface RollupIndicesState {
  isLoading: boolean;
  indexOptions: IndexOption[];
}

//TODO: Add error message
//TODO: Implement onChangeIndex
export default class RollupIndices extends Component<RollupIndicesProps, RollupIndicesState> {
  constructor(props: RollupIndicesProps) {
    super(props);
    this.state = {
      isLoading: true,
      indexOptions: [],
    };
  }

  async componentDidMount(): Promise<void> {
    await this.onIndexSearchChange("");
  }

  onIndexSearchChange = async (searchValue: string): Promise<void> => {
    const { indexService } = this.props;
    this.setState({ isLoading: true, indexOptions: [] });
    try {
      const searchIndicesResponse = await indexService.getIndices(searchValue, true);
      if (searchIndicesResponse.ok) {
        const policies = searchIndicesResponse.response.hits.hits.map((hit: { _id: string; _source: { policy: Policy } }) => ({
          label: hit._id,
          policy: hit._source.policy,
        }));
        this.setState({ indexOptions: policies });
      } else {
        if (searchIndicesResponse.error.startsWith("[index_not_found_exception]")) {
          toastNotifications.addDanger("You have not created a policy yet");
        } else {
          toastNotifications.addDanger(searchIndicesResponse.error);
        }
      }
    } catch (err) {
      toastNotifications.addDanger(err.message);
    }

    this.setState({ isLoading: false });
  };

  render() {
    const { sourceIndex, targetIndex, onCreateIndex, onChange } = this.props;
    const { isLoading, indexOptions } = this.state;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Indices" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiCallOut color="warning">
            <p>Indices cannot be changed once the job is created. Please ensure that you have correct spellings.</p>
          </EuiCallOut>
          <EuiSpacer size="m" />
          <EuiFormRow
            label="Source index"
            helpText="The index where this rollup job is performed on. Type in * as wildcard for index pattern."
          >
            <EuiComboBox
              placeholder="Select source index"
              options={indexOptions}
              selectedOptions={sourceIndex ? [sourceIndex] : []}
              onChange={onChange}
              singleSelection={true}
              onSearchChange={onIndexSearchChange}
              isLoading={isLoading}
            />
          </EuiFormRow>

          <EuiFormRow
            label="Target index"
            helpText="The index stores rollup results. You can look up or an existing index to reuse or type to create a new index."
          >
            <EuiComboBox
              placeholder="Select or create target index"
              options={indexOptions}
              selectedOptions={targetIndex ? [targetIndex] : []}
              onChange={onChange}
              onCreateOption={onCreateIndex}
              singleSelection={true}
              onSearchChange={onIndexSearchChange}
              isLoading={isLoading}
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
