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
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiTextArea, EuiText, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigureRollupProps {
  isEdit: boolean;
  rollupId: string;
  rollupIdError: string;
  onChangeName: (value: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  description: string;
}

const ConfigureRollup = ({ isEdit, rollupId, rollupIdError, onChangeName, onChangeDescription, description }: ConfigureRollupProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Job name and description" titleSize="m">
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiFormRow label="Name" helpText="Specify a unique, descriptive name." isInvalid={!!rollupIdError} error={rollupIdError}>
        <EuiFieldText isInvalid={!!rollupIdError} placeholder="my-rollupjob1" value={rollupId} onChange={onChangeName} disabled={isEdit} />
      </EuiFormRow>
      <EuiSpacer />
      <EuiFlexGroup gutterSize={"xs"}>
        <EuiFlexItem grow={false}>
          <EuiText size={"xs"}>
            <h4>Description</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size={"xs"} color={"subdued"}>
            <i> - optional</i>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size={"xs"} />
      <EuiFormRow>
        <EuiTextArea compressed={true} value={description} onChange={onChangeDescription} />
      </EuiFormRow>
    </div>
  </ContentPanel>
);
export default ConfigureRollup;
