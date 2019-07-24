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
import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";

interface ContentPanelActionsProps {
  actions: { text: string; [rest: string]: any }[];
}

const ContentPanelActions: React.SFC<ContentPanelActionsProps> = ({ actions }) => (
  <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
    {actions.map(({ text, ...rest }, index) => (
      <EuiFlexItem grow={false} key={index}>
        <EuiButton {...rest} data-test-subj={`${text}Button`}>
          {text}
        </EuiButton>
      </EuiFlexItem>
    ))}
  </EuiFlexGroup>
);

export default ContentPanelActions;
