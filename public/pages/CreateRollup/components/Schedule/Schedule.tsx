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
} from "@elastic/eui";
import { CalenderTimeunitOptions, FixedTimeunitOptions } from "../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ScheduleProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface ScheduleState {
  jobEnabledByDefault: boolean;
  recurringJob: string;
  recurringDefinition: string;
  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
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
  onChangeInterval: (e: ChangeEvent<HTMLInputElement>) => void,
  onChangeTimeunit: (value: ChangeEvent<HTMLSelectElement>) => void
) => (
  <React.Fragment>
    <EuiFlexGroup style={{ maxWidth: 400 }}>
      <EuiFlexItem grow={false} style={{ width: 200 }}>
        <EuiFormRow label="Rollup interval">
          <EuiFieldNumber value={interval} onChange={onChangeInterval} />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow hasEmptyLabelSpace={true}>
          <EuiSelect
            id="selectIntervalTimeunit"
            options={CalenderTimeunitOptions}
            value={intervalTimeunit}
            onChange={onChangeTimeunit}
            isInvalid={interval == undefined || interval <= 0}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </React.Fragment>
);

const defineCron = (cronExpression: string, onChangeCron: (value: ChangeEvent<HTMLTextAreaElement>) => void) => (
  <React.Fragment>
    <EuiFormRow label="Define by cron expression">
      <EuiTextArea value={cronExpression} onChange={onChangeCron} compressed={true} />
    </EuiFormRow>
  </React.Fragment>
);

export default class Schedule extends Component<ScheduleProps, ScheduleState> {
  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      jobEnabledByDefault: false,
      recurringJob: "no",
      recurringDefinition: "fixed",
      interval: 2,
      intervalTimeunit: "M",
      cronExpression: "",
      pageSize: 1000,
      delayTime: undefined,
      delayTimeunit: "m",
    };
  }

  onChangeCheck = (): void => {
    const checked = this.state.jobEnabledByDefault;
    this.setState({ jobEnabledByDefault: !checked });
  };

  onChangeCron = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ cronExpression: e.target.value });
  };

  onChangeDelayTime = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ delayTime: e.target.valueAsNumber });
  };

  onChangePage = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ pageSize: e.target.valueAsNumber });
  };

  onChangeRecurringDefinition = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ recurringDefinition: e.target.value });
  };

  onChangeRadio = (optionId: string): void => {
    this.setState({ recurringJob: optionId });
  };

  onChangeDelayTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ delayTimeunit: e.target.value });
  };

  onChangeIntervalTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ intervalTimeunit: e.target.value });
  };

  render() {
    const {
      jobEnabledByDefault,
      recurringJob,
      recurringDefinition,
      interval,
      intervalTimeunit,
      cronExpression,
      pageSize,
      delayTime,
      delayTimeunit,
    } = this.state;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiCheckbox
            id="jobEnabledByDefault"
            label="Job enabled by default"
            checked={jobEnabledByDefault}
            onChange={this.onChangeCheck}
          />
          <EuiSpacer size="m" />
          <EuiFormRow label="Recurring job">
            <EuiRadioGroup options={radios} idSelected={recurringJob} onChange={(id) => this.onChangeRadio(id)} name="recurringJob" />
          </EuiFormRow>
          <EuiSpacer size="m" />

          <EuiFormRow label={"Rollup execution frequency"}>
            <EuiSelect
              id="recurringDefinition"
              options={[
                { value: "fixed", text: "Define by fixed interval" },
                { value: "cron", text: "Define by cron expression" },
              ]}
              value={recurringDefinition}
              onChange={this.onChangeRecurringDefinition}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />

          {recurringDefinition == "fixed"
            ? selectInterval(interval, intervalTimeunit, this.onChangeDelayTime, this.onChangeIntervalTimeunit)
            : defineCron(cronExpression, this.onChangeCron)}

          <EuiSpacer size="m" />

          <EuiFormRow
            label="Page per execution"
            helpText={"The number of pages every execution processes. A larger number means faster execution and more cost on memory."}
          >
            <EuiFieldNumber min={1} placeholder={"1000"} value={pageSize} onChange={this.onChangePage} />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFlexGroup style={{ maxWidth: 400 }}>
            <EuiFlexItem grow={false} style={{ width: 200 }}>
              <EuiFormRow label="Execution delay - optional">
                <EuiFieldNumber value={delayTime} onChange={this.onChangeDelayTime} />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow hasEmptyLabelSpace={true}>
                <EuiSelect
                  id="selectTimeunit"
                  options={FixedTimeunitOptions}
                  value={delayTimeunit}
                  onChange={this.onChangeDelayTimeunit}
                  isInvalid={delayTime != undefined && delayTime <= 0}
                />
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
