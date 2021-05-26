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

import { EuiEmptyPrompt, EuiPanel, EuiText } from "@elastic/eui";
import React from "react";
import { TransformAggItem } from "../../../../../models/interfaces";

interface PreviewEmptyPromptProps {
  isReadOnly: boolean;
}

export default function PreviewEmptyPrompt({ isReadOnly }: PreviewEmptyPromptProps) {
  return (
    <EuiPanel>
      <EuiEmptyPrompt
        title={
          <EuiText size="m">
            <h4> No fields selected</h4>
          </EuiText>
        }
        body={
          isReadOnly ? (
            <p>No preview available</p>
          ) : (
            <p>From the table above, select a field you want to transform by clicking the “plus” button next to the field name</p>
          )
        }
      />
    </EuiPanel>
  );
}
