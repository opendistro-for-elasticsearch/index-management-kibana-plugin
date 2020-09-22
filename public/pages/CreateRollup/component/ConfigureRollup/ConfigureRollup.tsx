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
import { EuiSpacer, EuiFormRow, EuiFieldText } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigureRollupProps {
  rollupId: string;
  rollupIdError: string;
  isEdit: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

const ConfigureRollup = ({ isEdit, rollupId, rollupIdError, onChange }: ConfigureRollupProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Name and description" titleSize="s">
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiFormRow
        label="Name"
        helpText="Specify a unique and descriptive name. Allowed characters are..."
        isInvalid={!!rollupIdError}
        error={rollupIdError}
      >
        <EuiFieldText isInvalid={!!rollupIdError} placeholder="hot_cold_workflow" readOnly={isEdit} value={rollupId} onChange={onChange} />
      </EuiFormRow>
    </div>
  </ContentPanel>
);
export default ConfigureRollup;
