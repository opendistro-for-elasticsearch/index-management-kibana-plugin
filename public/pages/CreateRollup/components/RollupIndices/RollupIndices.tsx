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

import React from "react";
import { EuiSpacer, EuiFormRow, EuiComboBox, EuiCallOut } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { EuiComboBoxOptionOption } from "@elastic/eui/src/components/combo_box/types";
import { IndexOption } from "../../models/interfaces";

interface RollupIndicesProps {
  indices: ManagedCatIndex[];
  indicesOptions: IndexOption[];
  sourceIndex: IndexOption;
  targetIndex: IndexOption;
  onChange: (options: EuiComboBoxOptionOption<ManagedCatIndex>[]) => void;
}

//TODO: Handle creation of target index. May need to add prop.

// const onCreateOption = (searchValue: string, options: EuiComboBoxOptionOption<T>[]) => boolean
//   | void  => {
// };

const RollupIndices = ({ onChange, indices, indicesOptions, sourceIndex, targetIndex }: RollupIndicesProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Indices" titleSize="s">
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiCallOut color="warning">
        <p>Indices cannot be changed once the job is created. Please ensure that you have correct spellings.</p>
      </EuiCallOut>
      <EuiSpacer size="m" />
      <EuiFormRow label="Source index" helpText="The index where this rollup job is performed on. Type in * as wildcard for index pattern.">
        <EuiComboBox
          placeholder="Select source index"
          options={indicesOptions}
          selectedOptions={sourceIndex ? [sourceIndex] : []}
          onChange={onChange}
        />
      </EuiFormRow>

      <EuiFormRow
        label="Target index"
        helpText="The index stores rollup results. You can look up or an existing index to reuse or type to create a new index."
      >
        <EuiComboBox
          placeholder="Select or create target index"
          options={indicesOptions}
          selectedOptions={targetIndex ? [targetIndex] : []}
          onChange={onChange}
        />
      </EuiFormRow>
    </div>
  </ContentPanel>
);
export default RollupIndices;
