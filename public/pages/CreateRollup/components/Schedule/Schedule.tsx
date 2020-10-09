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
  EuiDatePicker,
  EuiSelect,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTextArea,
  EuiFormHelpText,
} from "@elastic/eui";
import moment, { Moment } from "moment";
import { FixedTimeunitOptions, TimezoneOptions } from "../../utils/constants";
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
  startDate: Moment;
  endDate: Moment | null;
  timezone: string;
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

const jobStartSelect = (
  startDate: Moment,
  timezone: string,
  handleDateChange: (value: Moment) => void,
  onChangeTimezone: (value: ChangeEvent<HTMLSelectElement>) => void
) => (
  <React.Fragment>
    <EuiFormRow label="Job starts on" isInvalid={startDate.isBefore(moment())} error={"Start date should be later than current time."}>
      <EuiDatePicker showTimeSelect selected={startDate} onChange={handleDateChange} isInvalid={startDate.isBefore(moment())} />
    </EuiFormRow>

    <EuiSpacer size="m" />

    <EuiFormRow label={"Timezone"}>
      <EuiSelect id="timezone" options={TimezoneOptions} value={timezone} onChange={onChangeTimezone} />
    </EuiFormRow>

    <EuiSpacer size="m" />
  </React.Fragment>
);

const jobEndSelect = (startDate: Moment, endDate: Moment | null, handleDateChange: (value: Moment | null) => void) => (
  <React.Fragment>
    <EuiFormRow
      label="Job ends on - optional"
      isInvalid={endDate != null && startDate.isAfter(endDate)}
      error={"End date should be later than start date"}
    >
      <EuiDatePicker
        showTimeSelect
        selected={endDate}
        onChange={handleDateChange}
        onClear={() => handleDateChange(null)}
        isInvalid={endDate != null && startDate.isAfter(endDate)}
      />
    </EuiFormRow>

    <EuiSpacer size="m" />
  </React.Fragment>
);

const defineCron = (cronExpression: string, onChangeCron: (value: ChangeEvent<HTMLTextAreaElement>) => void) => (
  <React.Fragment>
    <EuiFormRow label="Cron expression">
      <EuiTextArea value={cronExpression} onChange={onChangeCron} compressed={true} />
    </EuiFormRow>
    <EuiSpacer size="m" />
  </React.Fragment>
);

export default class Schedule extends Component<ScheduleProps, ScheduleState> {
  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      jobEnabledByDefault: false,
      recurringJob: "no",
      recurringDefinition: "date",
      startDate: moment().add(30, "minutes"),
      endDate: null,
      timezone: "-7",
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

  onChangeTimezone = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ timezone: e.target.value });
  };

  onChangeTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ delayTimeunit: e.target.value });
  };

  handleStartDateChange = (date: Moment): void => {
    this.setState({ startDate: date });
  };

  handleEndDateChange = (date: Moment | null): void => {
    this.setState({ endDate: date });
  };

  render() {
    const {
      jobEnabledByDefault,
      recurringJob,
      recurringDefinition,
      startDate,
      endDate,
      timezone,
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

          {/*Hide this part if the rollup job is not recurring*/}
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
          {(recurringJob == "no" || (recurringJob == "yes" && recurringDefinition == "date")) &&
            jobStartSelect(startDate, timezone, this.handleStartDateChange, this.onChangeTimezone)}

          {recurringJob == "yes" && recurringDefinition == "date" && jobEndSelect(startDate, endDate, this.handleEndDateChange)}
          {recurringJob == "yes" && recurringDefinition == "cron" && defineCron(cronExpression, this.onChangeCron)}
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
                  onChange={this.onChangeTimeunit}
                  disabled={delayTime == undefined}
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
