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

import React, { ChangeEvent, Component } from "react";
import {
  EuiSpacer,
  EuiCheckbox,
  EuiRadioGroup,
  EuiFormRow,
  EuiDatePicker,
  EuiSelect,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import moment, { Moment } from "moment";
import { TimeunitOptions } from "../../utils/constants";

interface ScheduleProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface ScheduleState {
  checked: boolean;
  recurringJob: string;
  recurringDefinition: string;
  startDate: Moment;
  timezone: number;
  pageSize: number;
  delayTime: number | null;
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

const timezones = [
  { value: 12, text: "UTC +12" },
  { value: 11, text: "UTC +11" },
  { value: 10, text: "UTC +10" },
  { value: 9, text: "UTC +9" },
  { value: 8, text: "UTC +8" },
  { value: 7, text: "UTC +7" },
  { value: 6, text: "UTC +6" },
  { value: 5, text: "UTC +5" },
  { value: 4, text: "UTC +4" },
  { value: 3, text: "UTC +3" },
  { value: 2, text: "UTC +2" },
  { value: 1, text: "UTC +1" },
  { value: 0, text: "UTC +0" },
  { value: -1, text: "UTC -1" },
  { value: -2, text: "UTC -2" },
  { value: -3, text: "UTC -3" },
  { value: -4, text: "UTC -4" },
  { value: -5, text: "UTC -5" },
  { value: -6, text: "UTC -6" },
  { value: -7, text: "UTC -7" },
  { value: -8, text: "UTC -8" },
  { value: -9, text: "UTC -9" },
  { value: -10, text: "UTC -10" },
  { value: -11, text: "UTC -11" },
  { value: -12, text: "UTC -12" },
];

const jobStartSelect = (startDate: Moment, timezone: number, handleDateChange: void, onChangeTimezone: ChangeEvent<HTMLSelectElement>) => (
  <React.Fragment>
    <EuiFormRow label="Job starts on">
      <EuiDatePicker showTimeSelect selected={startDate} onChange={handleDateChange} />
    </EuiFormRow>

    <EuiSpacer size="m" />

    <EuiFormRow label={"Timezone"}>
      <EuiSelect id="timezone" options={timezones} value={timezone} onChange={onChangeTimezone} />
    </EuiFormRow>

    <EuiSpacer size="m" />
  </React.Fragment>
);

export default class Schedule extends Component<ScheduleProps, ScheduleState> {
  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      checked: false,
      recurringJob: "no",
      recurringDefinition: "date",
      startDate: moment(),
      timezone: -7,
      pageSize: 1000,
      delayTime: null,
      delayTimeunit: "m",
    };
  }

  onChangeCheck = (): void => {
    const checked = this.state.checked;
    this.setState({ checked: !checked });
  };

  onChangeDelayTime = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ delayTime: e.target.value });
  };

  onChangeRecurringDefinition = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ recurringDefinition: e.target.value });
  };

  onChangeRadio = (optionId: string): void => {
    this.setState({ recurringJob: optionId });
  };

  onChangeTimezone = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ timezone: e.target.value });
  };

  onChangeTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ delayTimeunit: e.target.value });
  };

  handleDateChange = (date: Moment): void => {
    this.setState({ startDate: date });
  };

  render() {
    const { checked, recurringJob, recurringDefinition, startDate, timezone, pageSize, delayTime, delayTimeunit } = this.state;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiCheckbox id="jobEnabledByDefault" label="Job enabled by default" checked={checked} onChange={this.onChangeCheck} />
          <EuiSpacer size="m" />
          <EuiFormRow label="Recurring job">
            <EuiRadioGroup options={radios} idSelected={recurringJob} onChange={(id) => this.onChangeRadio(id)} name="recurringJob" />
          </EuiFormRow>
          <EuiSpacer size="m" />

          {/*Hide this portion of components if the rollup job is not recurring*/}
          {recurringJob == "yes" && (
            <EuiFormRow label={"Recurring definition"}>
              <EuiSelect
                id="recurringDefinition"
                options={[
                  { value: "date", text: "Choose date and time" },
                  { value: "cron", text: "Cron expression" },
                ]}
                value={recurringDefinition}
                onChange={this.onChangeRecurringDefinition}
              />
            </EuiFormRow>
          )}

          {/*Hide this part if is recurring job and defined by cron expression*/}
          {/*TODO: Add invalid and error for date picker*/}
          {(!recurringJob || (recurringJob && recurringDefinition == "date")) &&
            jobStartSelect(startDate, timezone, this.handleDateChange, this.onChangeTimezone)}
          {/*<EuiFormRow label="Job starts on">*/}
          {/*  <EuiDatePicker showTimeSelect selected={startDate} onChange={this.handleDateChange}/>*/}
          {/*</EuiFormRow>*/}

          {/*<EuiSpacer size="m"/>*/}

          {/*<EuiFormRow label={"Timezone"}>*/}
          {/*  <EuiSelect id="timezone" options={timezones} value={timezone} onChange={this.onChangeTimezone}/>*/}
          {/*</EuiFormRow>*/}

          <EuiSpacer size="m" />

          <EuiFormRow
            label="Page per execution"
            helpText={"The number of pages every execution processes. A larger number means faster execution and more cost on memory."}
          >
            <EuiFieldNumber min={1} placeholder={"1000"} value={pageSize} />
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
                  options={TimeunitOptions}
                  value={delayTimeunit}
                  onChange={this.onChangeTimeunit}
                  disabled={delayTime == null}
                  isInvalid={delayTime != null && delayTime <= 0}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </ContentPanel>
    );
  }
}
