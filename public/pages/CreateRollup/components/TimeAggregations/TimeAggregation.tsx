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
  EuiFormRow,
  EuiComboBox,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldNumber,
  EuiRadioGroup,
  EuiComboBoxOptionOption,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { CalenderTimeunitOptions, FixedTimeunitOptions, TimezoneOptions } from "../../utils/constants";

interface TimeAggregationProps {
  intervalType: string;
  selectedTimestamp: EuiComboBoxOptionOption<String>[];
  timestampOptions: EuiComboBoxOptionOption<String>[];
  timeunit: string;
  timezone: string;
  onChangeIntervalType: (optionId: string) => void;
  onChangeTimestamp: (options: EuiComboBoxOptionOption<String>[]) => void;
  onChangeTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeTimezone: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const radios = [
  {
    id: "fixed",
    label: "Fixed",
  },
  {
    id: "calender",
    label: "Calender",
  },
];
export default class TimeAggregation extends Component<TimeAggregationProps> {
  constructor(props: TimeAggregationProps) {
    super(props);
  }

  render() {
    const {
      intervalType,
      selectedTimestamp,
      timestampOptions,
      timeunit,
      timezone,
      onChangeIntervalType,
      onChangeTimestamp,
      onChangeTimeunit,
      onChangeTimezone,
    } = this.props;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Time aggregation" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFormRow label="Timestamp field">
            <EuiComboBox
              placeholder="Select timestamp"
              options={timestampOptions}
              selectedOptions={selectedTimestamp}
              onChange={onChangeTimestamp}
              singleSelection={true}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFormRow label="Interval type">
            <EuiRadioGroup options={radios} idSelected={intervalType} onChange={(id) => onChangeIntervalType(id)} name="intervalType" />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFlexGroup style={{ maxWidth: 300 }}>
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiFormRow label="Interval">
                <EuiFieldNumber min={1} placeholder="2" />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow hasEmptyLabelSpace={true}>
                <EuiSelect
                  id="selectTimeunit"
                  options={intervalType == "fixed" ? FixedTimeunitOptions : CalenderTimeunitOptions}
                  value={timeunit}
                  onChange={onChangeTimeunit}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiFormRow label="Timezone">
            <EuiSelect id="timezone" options={TimezoneOptions} value={timezone} onChange={onChangeTimezone} />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
