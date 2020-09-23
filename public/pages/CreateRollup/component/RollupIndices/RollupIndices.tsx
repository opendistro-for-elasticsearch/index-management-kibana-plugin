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

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiComboBox } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface RollupIndicesProps {
  rollupId: string;
  rollupIdError: string;
  isEdit: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

const RollupIndices = ({ isEdit, rollupId, rollupIdError, onChange }: RollupIndicesProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Indices" titleSize="s">
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiFormRow
        label="Source index"
        helpText="The index where this rollup job is performed on. Type in * as wildcard for index pattern."
        isInvalid={!!rollupIdError}
        error={rollupIdError}
      >
        <EuiComboBox
          placeholder="Select source index"
          // options={options}
          // selectedOptions={selectedOptions}
          // onChange={onChange}
          // onCreateOption={onCreateOption}
        />
      </EuiFormRow>

      <EuiFormRow
        label="Target index"
        helpText="The index stores rollup results. You can look up or an existing index to reuse or type to create a new index."
        isInvalid={!!rollupIdError}
        error={rollupIdError}
      >
        <EuiComboBox
          placeholder="Select or create target index"
          // options={options}
          // selectedOptions={selectedOptions}
          // onChange={onChange}
          // onCreateOption={onCreateOption}
        />
      </EuiFormRow>
    </div>
  </ContentPanel>
);
export default RollupIndices;
