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

import {TransformMetadata} from "../../../../models/interfaces";
import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from "@elastic/eui";

// TODO: merge with rollup helper to have a common helper
export const renderStatus = (metadata: TransformMetadata | undefined): JSX.Element => {
  if (metadata == null || metadata.transform_metadata == null) return <dd>-</dd>;
  let icon;
  let iconColor;
  let textColor: "default" | "subdued" | "secondary" | "ghost" | "accent" | "warning" | "danger" | undefined;
  let text;
  switch (metadata.transform_metadata.status) {
    case "failed":
      icon = "alert";
      iconColor = "danger";
      textColor = "danger";
      text = "Failed: " + metadata.transform_metadata.failure_reason;
      break;
    case "finished":
      icon = "check";
      iconColor = "success";
      textColor = "secondary";
      text = "Complete";
      break;
    case "init":
      return (
        <EuiFlexGroup gutterSize="xs">
          <EuiFlexItem grow={false}>
            <EuiIcon size="s" type="clock" color="primary" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="xs" style={{ color: "#006BB4" }}>
              Initializing
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    case "started":
      icon = "play";
      iconColor = "success";
      textColor = "secondary";
      text = "Started";
      break;
    case "stopped":
      icon = "stop";
      iconColor = "subdued";
      textColor = "subdued";
      text = "Stopped";
      break;
    default:
      return <dd>-</dd>;
  }

  return (
    <EuiFlexGroup gutterSize="xs">
      <EuiFlexItem grow={false}>
        <EuiIcon size="s" type={icon} color={iconColor} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText size="xs" color={textColor}>
          {text}
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export const renderEnabled = (isEnabled: boolean): string => {
  return isEnabled ? "Enabled" : "Disabled";
};
