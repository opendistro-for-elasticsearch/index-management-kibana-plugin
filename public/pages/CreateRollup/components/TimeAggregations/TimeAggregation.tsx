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

import React, { ChangeEvent, Component, Fragment } from "react";
import {
  EuiSpacer,
  EuiFormRow,
  EuiComboBox,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldNumber,
  EuiRadioGroup,
  EuiComboBoxOptionOption,
  EuiPanel,
  EuiTitle,
  EuiFormHelpText,
  EuiHorizontalRule,
  EuiText,
} from "@elastic/eui";
import { CalendarTimeunitOptions, FixedTimeunitOptions } from "../../utils/constants";
import { RollupService } from "../../../../services";
import moment from "moment-timezone";
import { FieldItem } from "../../../../../models/interfaces";

interface TimeAggregationProps {
  rollupService: RollupService;
  intervalValue: number;
  intervalType: string;
  selectedTimestamp: EuiComboBoxOptionOption<String>[];
  timestampError: string;
  timeunit: string;
  timezone: string;
  fieldsOption: FieldItem[];

  onChangeIntervalType: (optionId: string) => void;
  onChangeIntervalValue: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeTimestamp: (options: EuiComboBoxOptionOption<String>[]) => void;
  onChangeTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeTimezone: (e: ChangeEvent<HTMLSelectElement>) => void;
}

interface TimeAggregationState {}

const radios = [
  {
    id: "fixed",
    label: "Fixed",
  },
  {
    id: "calendar",
    label: "Calendar",
  },
];

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

export default class TimeAggregation extends Component<TimeAggregationProps, TimeAggregationState> {
  constructor(props: TimeAggregationProps) {
    super(props);
  }

  render() {
    const {
      intervalType,
      intervalValue,
      selectedTimestamp,
      timestampError,
      timeunit,
      timezone,
      onChangeIntervalType,
      onChangeIntervalValue,
      onChangeTimestamp,
      onChangeTimeunit,
      onChangeTimezone,
      fieldsOption,
    } = this.props;

    // Filter options for date histogram
    const dateFields = fieldsOption.filter((item) => item.type == "date");

    return (
      <EuiPanel>
        <EuiTitle size="m">
          <h3>Time aggregation </h3>
        </EuiTitle>
        <EuiFormHelpText>
          Your source indices must include a timestamp field. The rollup job creates a date histogram for the field you specify." "
        </EuiFormHelpText>
        <EuiHorizontalRule margin="xs" />
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFormRow label="Timestamp field" error={timestampError} isInvalid={!!timestampError}>
            <EuiComboBox
              placeholder="Select timestamp"
              options={dateFields}
              selectedOptions={selectedTimestamp}
              onChange={onChangeTimestamp}
              singleSelection={{ asPlainText: true }}
              isInvalid={!!timestampError}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFormRow label="Interval type">
            <EuiRadioGroup options={radios} idSelected={intervalType} onChange={(id) => onChangeIntervalType(id)} name="intervalType" />
          </EuiFormRow>
          <EuiFlexGroup style={{ maxWidth: 300 }}>
            {intervalType == "fixed" ? (
              <Fragment>
                <EuiSpacer size="m" />
                <EuiFlexItem grow={false} style={{ width: 100 }}>
                  <EuiFormRow label="Interval">
                    <EuiFieldNumber min={1} value={intervalType == "fixed" ? intervalValue : 1} onChange={onChangeIntervalValue} />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow hasEmptyLabelSpace={true}>
                    <EuiSelect
                      id="selectTimeunit"
                      options={intervalType == "fixed" ? FixedTimeunitOptions : CalendarTimeunitOptions}
                      value={timeunit}
                      onChange={onChangeTimeunit}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </Fragment>
            ) : (
              <Fragment>
                <EuiFlexItem grow={false}>
                  <EuiFormRow hasEmptyLabelSpace={true}>
                    <EuiText size="m">
                      <dd>Every 1</dd>{" "}
                    </EuiText>
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow hasEmptyLabelSpace={true}>
                    <EuiSelect
                      id="selectTimeunit"
                      options={intervalType == "fixed" ? FixedTimeunitOptions : CalendarTimeunitOptions}
                      value={timeunit}
                      onChange={onChangeTimeunit}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </Fragment>
            )}
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiFormRow label="Timezone" helpText="A day starts from 00:00:00 in the specified timezone.">
            <EuiSelect id="timezone" options={timezones} value={timezone} onChange={onChangeTimezone} />
          </EuiFormRow>
        </div>
      </EuiPanel>
    );
  }
}
