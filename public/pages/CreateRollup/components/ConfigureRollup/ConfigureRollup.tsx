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

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiTextArea } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigureRollupProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  description: string;
}

//TODO: Define the allowed characters for rollup job name.
const ConfigureRollup = ({ rollupId, rollupIdError, onChange, onChangeDescription, description }: ConfigureRollupProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Job name and description" titleSize="m">
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiFormRow
        label="Name"
        helpText="Specify a unique and descriptive name. Allowed characters are... Name cannot be changed after creation."
        isInvalid={!!rollupIdError}
        error={rollupIdError}
      >
        <EuiFieldText isInvalid={!!rollupIdError} placeholder="my-rollupjob1" value={rollupId} onChange={onChange} />
      </EuiFormRow>

      <EuiFormRow label="Description - optional" helpText="Describe details about this rollup job.">
        <EuiTextArea compressed={true} value={description} onChange={onChangeDescription} />
      </EuiFormRow>
    </div>
  </ContentPanel>
);
export default ConfigureRollup;
