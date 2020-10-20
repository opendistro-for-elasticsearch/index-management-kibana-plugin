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

import React, { ChangeEvent, Component } from "react";
import {
  EuiSpacer,
  EuiCheckbox,
  EuiRadioGroup,
  EuiFormRow,
  EuiSelect,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTextArea,
  EuiFormHelpText,
  EuiText,
} from "@elastic/eui";
import { CalendarTimeunitOptions, DelayTimeunitOptions } from "../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ScheduleProps {
  isEdit: boolean;
  rollupId: string;
  rollupIdError: string;
  jobEnabledByDefault: boolean;
  recurringJob: string;
  recurringDefinition: string;
  interval: number;
  intervalTimeunit: string;
  intervalError: string;
  cronExpression: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  onChangeJobEnabledByDefault: () => void;
  onChangeCron: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeDelayTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeIntervalTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangePage: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeRecurringDefinition: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeRecurringJob: (optionId: string) => void;
  onChangeDelayTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeIntervalTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const radios = [
  {
    id: "no",
    label: "No",
  },
  {
    id: "yes",
    label: "Yes",
  },
];

const selectInterval = (
  interval: number,
  intervalTimeunit: string,
  intervalError: string,
  onChangeInterval: (e: ChangeEvent<HTMLInputElement>) => void,
  onChangeTimeunit: (value: ChangeEvent<HTMLSelectElement>) => void
) => (
  <React.Fragment>
    <EuiFlexGroup style={{ maxWidth: 400 }}>
      <EuiFlexItem grow={false} style={{ width: 200 }}>
        <EuiFormRow label="Rollup interval" error={intervalError} isInvalid={intervalError != ""}>
          <EuiFieldNumber value={interval} onChange={onChangeInterval} isInvalid={intervalError != ""} />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow hasEmptyLabelSpace={true}>
          <EuiSelect
            id="selectIntervalTimeunit"
            options={CalendarTimeunitOptions}
            value={intervalTimeunit}
            onChange={onChangeTimeunit}
            isInvalid={interval == undefined || interval <= 0}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </React.Fragment>
);

const isRecurring = (recurringJob: string, onChangeRecurringJob: (optionId: string) => void) => (
  <React.Fragment>
    <EuiFormRow label="Continuous">
      <EuiRadioGroup options={radios} idSelected={recurringJob} onChange={(id) => onChangeRecurringJob(id)} name="recurringJob" />
    </EuiFormRow>
    <EuiSpacer size="m" />
  </React.Fragment>
);

const defineCron = (cronExpression: string, onChangeCron: (value: ChangeEvent<HTMLTextAreaElement>) => void) => (
  <React.Fragment>
    <EuiFormRow label="Define by cron expression">
      <EuiTextArea value={cronExpression} onChange={onChangeCron} compressed={true} />
    </EuiFormRow>
  </React.Fragment>
);

export default class Schedule extends Component<ScheduleProps> {
  constructor(props: ScheduleProps) {
    super(props);
  }

  render() {
    const {
      isEdit,
      jobEnabledByDefault,
      recurringJob,
      recurringDefinition,
      interval,
      intervalTimeunit,
      intervalError,
      cronExpression,
      pageSize,
      delayTime,
      delayTimeunit,
      onChangeJobEnabledByDefault,
      onChangeCron,
      onChangeDelayTime,
      onChangeIntervalTime,
      onChangePage,
      onChangeRecurringDefinition,
      onChangeRecurringJob,
      onChangeDelayTimeunit,
      onChangeIntervalTimeunit,
    } = this.props;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          {!isEdit && (
            <EuiCheckbox
              id="jobEnabledByDefault"
              label="Enable job by default"
              checked={jobEnabledByDefault}
              onChange={onChangeJobEnabledByDefault}
            />
          )}
          <EuiSpacer size="m" />
          {!isEdit && isRecurring(recurringJob, onChangeRecurringJob)}

          <EuiFormRow label={"Rollup execution frequency"}>
            <EuiSelect
              id="recurringDefinition"
              options={[
                { value: "fixed", text: "Define by fixed interval" },
                { value: "cron", text: "Define by cron expression" },
              ]}
              value={recurringDefinition}
              onChange={onChangeRecurringDefinition}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />

          {recurringDefinition == "fixed"
            ? selectInterval(interval, intervalTimeunit, intervalError, onChangeIntervalTime, onChangeIntervalTimeunit)
            : defineCron(cronExpression, onChangeCron)}

          <EuiSpacer size="m" />

          <EuiFormRow
            label="Page per execution"
            helpText={"The number of pages every execution processes. A larger number means faster execution and more cost on memory."}
          >
            <EuiFieldNumber min={1} placeholder={"1000"} value={pageSize} onChange={onChangePage} />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFlexGroup style={{ maxWidth: 400 }}>
            <EuiFlexItem grow={false} style={{ width: 200 }}>
              <EuiFlexGroup gutterSize={"xs"}>
                <EuiFlexItem grow={false}>
                  <EuiText size={"xs"}>
                    <h4>Execution delay</h4>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText size={"xs"} color={"subdued"}>
                    <i> - optional</i>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFormRow>
                <EuiFieldNumber value={delayTime} onChange={onChangeDelayTime} />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow hasEmptyLabelSpace={true}>
                <EuiSelect id="selectTimeunit" options={DelayTimeunitOptions} value={delayTimeunit} onChange={onChangeDelayTimeunit} />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFormHelpText style={{ maxWidth: 400 }}>
            The amount of time the job wait for data ingestion to accommodate any necessary processing time.
          </EuiFormHelpText>
        </div>
      </ContentPanel>
    );
  }
}
