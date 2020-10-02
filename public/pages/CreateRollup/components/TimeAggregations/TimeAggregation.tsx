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
import { EuiSpacer, EuiFormRow, EuiComboBox, EuiSelect, EuiFlexGroup, EuiFlexItem, EuiFieldNumber, EuiRadioGroup } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { CalenderTimeunitOptions, FixedTimeunitOptions, TimezoneOptions } from "../../utils/constants";

interface TimeAggregationProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  // onChangeStateRadio: (optionId: string) => void;
  // stateRadioIdSelected: string;
}

interface TimeAggregationState {
  intervalType: string;
  timezone: number;
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
export default class TimeAggregation extends Component<TimeAggregationProps, TimeAggregationState> {
  constructor(props: TimeAggregationProps) {
    super(props);

    this.state = {
      intervalType: "fixed",
      timezone: -7,
    };
  }

  onChangeRadio = (optionId: string): void => {
    this.setState({ intervalType: optionId });
  };

  render() {
    const { rollupIdError } = this.props;
    const { intervalType, timezone } = this.state;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Time aggregation" titleSize="s">
        {/*<EuiFormHelpText> Rolling up by a date dimension is required</EuiFormHelpText>*/}
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFormRow label="Timestamp field" isInvalid={!!rollupIdError} error={rollupIdError}>
            <EuiComboBox
              placeholder="Select timestamp"
              // options={timeUnitOptions}
              // selectedOptions={selectedOptions}
              // onChange={onChange}
              // onCreateOption={onCreateOption}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFormRow label="Interval type" isInvalid={!!rollupIdError} error={rollupIdError}>
            <EuiRadioGroup options={radios} idSelected={intervalType} onChange={(id) => this.onChangeRadio(id)} name="intervalType" />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFlexGroup style={{ maxWidth: 300 }}>
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiFormRow label="Interval" isInvalid={!!rollupIdError} error={rollupIdError}>
                <EuiFieldNumber min={1} placeholder="2" />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              {/*Change the options of timeunits according to the interval type*/}
              <EuiFormRow hasEmptyLabelSpace={true}>
                <EuiSelect
                  id="selectTimeunit"
                  options={intervalType == "fixed" ? FixedTimeunitOptions : CalenderTimeunitOptions}
                  value={timezone}
                  // onChange={onChange}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size="m" />
          {/*Create monitor from alerting uses moment library for timezone*/}
          <EuiFormRow label="Timezone">
            <EuiSelect
              id="timezone"
              options={TimezoneOptions}
              value={timezone}
              // onChange={onChange}
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
