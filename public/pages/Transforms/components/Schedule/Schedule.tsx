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
import {
  EuiSpacer,
  EuiCheckbox,
  EuiAccordion,
  EuiFormRow,
  EuiFieldNumber,
} from "@elastic/eui";
// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { ContentPanel } from "../../../../components/ContentPanel";
import { selectInterval } from "../../utils/metadataHelper";

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
      interval,
      intervalError,
      intervalTimeUnit,
      onIntervalChange,
      onIntervalTimeUnitChange,
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

          {/* TODO: Removing transform execution frequency dropdown menu as only fix interval will be supported in P0. */}
          {/*<EuiFormRow label="Transform execution frequency">*/}
          {/*  <EuiSelect*/}
          {/*    id="executionFrequency"*/}
          {/*    options={ExecutionFrequencyDefinitionOptions}*/}
          {/*    value={schedule}*/}
          {/*    onChange={onScheduleChange}*/}
          {/*  />*/}
          {/*</EuiFormRow>*/}
          {/*<EuiSpacer size="m" />*/}

          {/* TODO: Replace with switch block when define by cron expressions is supported. */}
          {selectInterval(interval, intervalTimeUnit, intervalError, onIntervalChange, onIntervalTimeUnitChange)}
          {/*{schedule == "fixed"*/}
          {/*  ? selectInterval(interval, intervalTimeUnit, intervalError, onIntervalChange, onIntervalTimeUnitChange)*/}
          {/*  : selectCronExpression(cronExpression, onCronExpressionChange, cronTimeZone, onCronTimeZoneChange)}*/}

          <EuiSpacer size="m" />

          <EuiAccordion id={htmlIdGenerator()()} buttonContent="Advanced">
            <EuiSpacer size="m" />
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
