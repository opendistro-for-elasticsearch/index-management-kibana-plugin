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
import {
  EuiSpacer,
  EuiButton,
  EuiTextArea,
  EuiText,
  // @ts-ignore
  EuiCopy,
} from "@elastic/eui";
import { ContentPanel } from "../../../../../components/ContentPanel";

interface DefinePolicyProps {
  jsonString: string;
  hasJSONError: boolean;
  onChange: (value: string) => void;
  onAutoIndent: () => void;
}

/*
 * Attempting to test EuiCodeEditor which uses react-ace was a lot more effort than seemed worthwhile
 * at the moment, so in the meantime we will mock DefinePolicy as a EuiTextArea so that we can still test
 * the functionality of CreatePolicy (minus the JSON code editor).
 * */
const DefinePolicy = ({ jsonString, onChange, onAutoIndent, hasJSONError }: DefinePolicyProps) => (
  <ContentPanel
    bodyStyles={{ padding: "initial" }}
    title="Define policy"
    titleSize="s"
    actions={[
      <EuiCopy textToCopy={jsonString}>
        {(copy: () => void) => (
          <EuiButton iconType="copyClipboard" onClick={copy}>
            Copy
          </EuiButton>
        )}
      </EuiCopy>,
      <EuiButton iconType="editorAlignLeft" onClick={onAutoIndent} disabled={hasJSONError}>
        Auto Indent
      </EuiButton>,
    ]}
  >
    <div style={{ paddingLeft: "10px" }}>
      <EuiText size="xs">
        <p>Create a policy with a JSON configuration file. This can be added directly in the code editor below.</p>
      </EuiText>
    </div>
    <EuiSpacer size="s" />
    <EuiTextArea value={jsonString} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} aria-label="Code Editor" />
  </ContentPanel>
);

export default DefinePolicy;
