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

import React, { ChangeEvent, Component } from "react";
import moment from "moment-timezone";
import {
  EuiSpacer,
  EuiCheckbox,
  EuiAccordion,
  EuiFormRow,
  EuiSelect,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTextArea,
} from "@elastic/eui";
// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { ScheduleIntervalTimeunitOptions } from "../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ScheduleProps {
  transformId: string;
  error: string;
  enabled: boolean;
  pageSize: number;
  onEnabledChange: () => void;
  schedule: string;
  interval: number;
  intervalTimeUnit: string;
  intervalError: string;
  cronExpression: string;
  cronTimeZone: string;
  onPageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onScheduleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onCronExpressionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onCronTimeZoneChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onIntervalChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onIntervalTimeUnitChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const selectInterval = (
  interval: number,
  intervalTimeunit: string,
  intervalError: string,
  onIntervalChange: (e: ChangeEvent<HTMLInputElement>) => void,
  onIntervalTimeUnitChange: (value: ChangeEvent<HTMLSelectElement>) => void
) => (
  <React.Fragment>
    <EuiFlexGroup style={{ maxWidth: 400 }}>
      <EuiFlexItem grow={false} style={{ width: 200 }}>
        <EuiFormRow label="Transform interval" error={intervalError} isInvalid={intervalError != ""}>
          <EuiFieldNumber value={interval} onChange={onIntervalChange} isInvalid={intervalError != ""} />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow hasEmptyLabelSpace={true}>
          <EuiSelect
            id="selectIntervalTimeunit"
            options={ScheduleIntervalTimeunitOptions}
            value={intervalTimeunit}
            onChange={onIntervalTimeUnitChange}
            isInvalid={interval == undefined || interval <= 0}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </React.Fragment>
);

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

// TODO: Check wording for page size form with UX team
export default class Schedule extends Component<ScheduleProps> {
  constructor(props: ScheduleProps) {
    super(props);
  }

  render() {
    const {
      enabled,
      pageSize,
      onEnabledChange,
      onPageChange,
      schedule,
      onScheduleChange,
      interval,
      intervalError,
      intervalTimeUnit,
      onIntervalChange,
      onIntervalTimeUnitChange,
      cronExpression,
      cronTimeZone,
      onCronExpressionChange,
      onCronTimeZoneChange,
    } = this.props;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiCheckbox
            id="jobEnabled"
            label="Job enabled by default"
            checked={enabled}
            onChange={onEnabledChange}
            data-test-subj="jobEnabled"
          />
          <EuiSpacer size="m" />

          <EuiFormRow label="Transform execution frequency">
            <EuiSelect
              id="executionFrequency"
              options={[
                { value: "fixed", text: "Define by fixed interval" },
                { value: "cron", text: "Define by cron expression" },
              ]}
              value={schedule}
              onChange={onScheduleChange}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />

          {schedule == "fixed" ? (
            selectInterval(interval, intervalTimeUnit, intervalError, onIntervalChange, onIntervalTimeUnitChange)
          ) : (
            <React.Fragment>
              <EuiFormRow label="Define by cron expression">
                <EuiTextArea value={cronExpression} onChange={onCronExpressionChange} compressed={true} />
              </EuiFormRow>
              <EuiFormRow label="Timezone" helpText="A day starts from 00:00:00 in the specified timezone.">
                <EuiSelect id="timezone" options={timezones} value={cronTimeZone} onChange={onCronTimeZoneChange} />
              </EuiFormRow>
            </React.Fragment>
          )}

          <EuiSpacer size="m" />

          <EuiAccordion id={htmlIdGenerator()()} buttonContent={"Advanced"}>
            <EuiFormRow
              label={"Pages per execution"}
              helpText={
                "Determines the number of transformed buckets that are computed and indexed at a time. A larger number means faster execution, but costs more memory. An exception occurs when memory limits are exceeded. We recommend you to start with default value and adjust based on your use case."
              }
            >
              <EuiFieldNumber min={1} placeholder="1000" value={pageSize} onChange={onPageChange} />
            </EuiFormRow>
          </EuiAccordion>
        </div>
      </ContentPanel>
    );
  }
}
