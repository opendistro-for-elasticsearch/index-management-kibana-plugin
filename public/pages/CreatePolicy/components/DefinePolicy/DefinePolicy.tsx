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

import React from "react";
import {
  EuiSpacer,
  EuiButton,
  // @ts-ignore
  EuiCodeEditor,
  EuiText,
  // @ts-ignore
  EuiCopy,
  EuiLink,
  EuiIcon,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import { DarkModeConsumer } from "../../../../components/DarkMode";
import { DOCUMENTATION_URL } from "../../../../utils/constants";

interface DefinePolicyProps {
  jsonString: string;
  hasJSONError: boolean;
  onChange: (value: string) => void;
  onAutoIndent: () => void;
}

// TODO: Add custom autocomplete for Policy syntax
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
        Auto indent
      </EuiButton>,
    ]}
  >
    <div style={{ paddingLeft: "10px" }}>
      <EuiText size="xs">
        <p>
          You can think of policies as state machines. "Actions" are the operations ISM performs when an index is in a certain state.
          "Transitions" define when to move from one state to another.{" "}
          <EuiLink href={DOCUMENTATION_URL} target="_blank">
            Learn more <EuiIcon type="popout" size="s" />
          </EuiLink>
        </p>
      </EuiText>
    </div>
    <EuiSpacer size="m" />
    <DarkModeConsumer>
      {isDarkMode => (
        <EuiCodeEditor
          mode="json"
          theme={isDarkMode ? "sense-dark" : "github"}
          width="100%"
          value={jsonString}
          onChange={onChange}
          setOptions={{ fontSize: "14px" }}
          aria-label="Code Editor"
        />
      )}
    </DarkModeConsumer>
  </ContentPanel>
);

export default DefinePolicy;
