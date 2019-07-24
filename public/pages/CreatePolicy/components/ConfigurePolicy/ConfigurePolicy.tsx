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
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiText } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigurePolicyProps {
  policyId: string;
  policyIdError: string;
  isEdit: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onFocus: () => void;
}

const ConfigurePolicy = ({ isEdit, policyId, policyIdError, onChange, onBlur, onFocus }: ConfigurePolicyProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Policy" titleSize="s">
    <div style={{ paddingLeft: "10px" }}>
      <EuiText size="xs">
        <p>Specify a unique ID that helps you identify this policy</p>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiFormRow label="Policy ID" helpText="Use something easy to remember" isInvalid={!!policyIdError} error={policyIdError}>
        <EuiFieldText
          isInvalid={!!policyIdError}
          placeholder="Policy ID"
          readOnly={isEdit}
          value={policyId}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
        />
      </EuiFormRow>
    </div>
  </ContentPanel>
);

export default ConfigurePolicy;
