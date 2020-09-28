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
import { EuiSpacer, EuiCheckbox, EuiRadioGroup, EuiFormRow, EuiDatePicker, EuiSelect } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import moment, { Moment } from "moment";

interface ScheduleProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface ScheduleState {
  checked: boolean;
  radioIdSelected: string;
  startDate: Moment;
  timezone: number;
}
const radios = [
  {
    id: `no`,
    label: "No",
  },
  {
    id: `yes`,
    label: "Yes",
  },
];

const timezones = [
  { value: +12, text: "UTC +12" },
  { value: +11, text: "UTC +11" },
  { value: +10, text: "UTC +10" },
  { value: +9, text: "UTC +9" },
  { value: +8, text: "UTC +8" },
  { value: +7, text: "UTC +7" },
  { value: +6, text: "UTC +6" },
  { value: +5, text: "UTC +5" },
  { value: +4, text: "UTC +4" },
  { value: +3, text: "UTC +3" },
  { value: +2, text: "UTC +2" },
  { value: +1, text: "UTC +1" },
  { value: 0, text: "UTC +0" },
  { value: -1, text: "UTC -01" },
  { value: -2, text: "UTC -02" },
  { value: -3, text: "UTC -03" },
  { value: -4, text: "UTC -04" },
  { value: -5, text: "UTC -05" },
  { value: -6, text: "UTC -06" },
  { value: -7, text: "UTC -07" },
  { value: -8, text: "UTC -08" },
  { value: -9, text: "UTC -09" },
  { value: -10, text: "UTC -10" },
  { value: -11, text: "UTC -11" },
  { value: -12, text: "UTC -12" },
];

export default class Schedule extends Component<ScheduleProps, ScheduleState> {
  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      checked: false,
      radioIdSelected: "no",
      startDate: moment(),
      timezone: -7,
    };
  }

  onChangeCheck = (): void => {
    const checked = this.state.checked;
    this.setState({ checked: !checked });
  };

  onChangeRadio = (optionId: string): void => {
    this.setState({ radioIdSelected: optionId });
  };

  // onChangeTimezone = ()

  handleDateChange = (date: Moment): void => {
    this.setState({ startDate: date });
  };

  render() {
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiCheckbox id="jobEnabledByDefault" label="Job enabled by default" checked={this.state.checked} onChange={this.onChangeCheck} />
          <EuiSpacer size="m" />
          <EuiFormRow label="Recurring job">
            <EuiRadioGroup
              options={radios}
              idSelected={this.state.radioIdSelected}
              onChange={(id) => this.onChangeRadio(id)}
              name="recurringJob"
              // legend={{
              //   children: <span>Recurring job</span>,
              // }}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          {/*TODO: Add invalid and error for date picker*/}
          <EuiFormRow label="Job starts on">
            <EuiDatePicker showTimeSelect selected={this.state.startDate} onChange={this.handleDateChange} />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFormRow label={"Timezone"}>
            <EuiSelect
              id="timezone"
              options={timezones}
              // value={value}
              // onChange={onChangeTimezone}
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
