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

import { TransformMetadata } from "../../../../models/interfaces";
import React, { ChangeEvent } from "react";
import moment from "moment-timezone";
import { EuiFieldNumber, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiFormRow, EuiLink, EuiSelect, EuiTextArea, EuiText } from "@elastic/eui";
import { ScheduleIntervalTimeunitOptions } from "../../CreateTransform/utils/constants";
import ErrorModal from "../components/ErrorModal";
import { ModalConsumer } from "../../../components/Modal";

// TODO: merge with rollup helper to have a common helper
export const renderStatus = (metadata: TransformMetadata | undefined): JSX.Element => {
  if (metadata == null || metadata.transform_metadata == null) return <dd>-</dd>;

  // Notes regarding color options:
  //    'subdued' = a shade of black
  //    'success' = a shade of green
  //    'danger' = a shade of red
  //    '#DDDDDD' = a shade of grey
  let iconColor: "subdued" | "success" | "danger" | "#DDDDDD" | undefined;
  let text;

  switch (metadata.transform_metadata.status) {
    case "failed":
      iconColor = "danger";
      text = "Error";
      return (
        <EuiFlexGroup gutterSize="xs" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiIcon size={"s"} type={"dot"} color={iconColor} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size={"xs"}>
              <ModalConsumer>{({ onShow }) => <EuiLink onClick={() => onShow(ErrorModal, { metadata })}>{text}</EuiLink>}</ModalConsumer>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    case "finished":
      iconColor = "success";
      text = "Complete";
      break;
    case "init" || "started":
      iconColor = "subdued";
      text = "Initializing...";
      break;
    case "stopped":
      iconColor = "#DDDDDD";
      text = "Stopped";
      break;
    default:
      return <dd>-</dd>;
  }

  return (
    <EuiFlexGroup gutterSize="xs" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiIcon size={"s"} type={"dot"} color={iconColor} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText size={"xs"}>{text}</EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export const renderEnabled = (isEnabled: boolean): string => {
  return isEnabled ? "Enabled" : "Disabled";
};

export const selectInterval = (
  interval: number,
  intervalTimeunit: string,
  intervalError: string,
  onChangeInterval: (e: ChangeEvent<HTMLInputElement>) => void,
  onChangeTimeunit: (value: ChangeEvent<HTMLSelectElement>) => void
) => (
  <React.Fragment>
    <EuiFlexGroup style={{ maxWidth: 400 }}>
      <EuiFlexItem grow={false} style={{ width: 200 }}>
        <EuiFormRow label="Transform execution interval" error={intervalError} isInvalid={intervalError != ""}>
          <EuiFieldNumber value={interval} onChange={onChangeInterval} isInvalid={intervalError != ""} />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow hasEmptyLabelSpace={true}>
          <EuiSelect
            id="selectIntervalTimeunit"
            options={ScheduleIntervalTimeunitOptions}
            value={intervalTimeunit}
            onChange={onChangeTimeunit}
            isInvalid={interval == undefined || interval <= 0}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </React.Fragment>
);

export const selectCronExpression = (
  cronExpression: string,
  onCronExpressionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void,
  cronTimeZone: string,
  onCronTimeZoneChange: (e: ChangeEvent<HTMLSelectElement>) => void
) => (
  <React.Fragment>
    <EuiFormRow label="Define by cron expression">
      <EuiTextArea value={cronExpression} onChange={onCronExpressionChange} compressed={true} />
    </EuiFormRow>
    <EuiFormRow label="Timezone" helpText="A day starts from 00:00:00 in the specified timezone.">
      <EuiSelect id="timezone" options={timezones} value={cronTimeZone} onChange={onCronTimeZoneChange} />
    </EuiFormRow>
  </React.Fragment>
);

export const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));
