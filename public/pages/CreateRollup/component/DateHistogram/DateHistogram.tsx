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
import { EuiSpacer, EuiFormRow, EuiComboBox, EuiSelect } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface DateHistogramProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  // onChangeStateRadio: (optionId: string) => void;
  // stateRadioIdSelected: string;
}
const timeUnitOptions = [
  { value: "ms", text: "Milliseconds" },
  { value: "s", text: "Seconds" },
  { value: "m", text: "Minutes" },
  { value: "h", text: "Hours" },
  { value: "d", text: "Days" },
];

export default class DateHistogram extends Component<DateHistogramProps> {
  render() {
    const {
      rollupIdError,
      // stateRadioIdSelected
    } = this.props;

    // const currentRadio = { id: Radio.Current, label: "Fixed"};
    // const stateRadio = { id: Radio.State, label: "Calender", };
    // const radioOptions = [currentRadio, stateRadio];

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Date Histogram" titleSize="s">
        {/*<EuiFormHelpText> Rolling up by a date dimension is required</EuiFormHelpText>*/}
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFormRow label="Timestamp" isInvalid={!!rollupIdError} error={rollupIdError}>
            <EuiComboBox
              placeholder="Select timestamp"
              // options={timeUnitOptions}
              // selectedOptions={selectedOptions}
              // onChange={onChange}
              // onCreateOption={onCreateOption}
            />
          </EuiFormRow>
          <EuiSpacer size="s" />
          {/*<EuiFormRow label="Interval type"  isInvalid={!!rollupIdError} error={rollupIdError}>*/}
          {/*  <EuiRadioGroup options={radioOptions} idSelected={stateRadioIdSelected} onChange={this.props.onChangeStateRadio} />*/}
          {/*</EuiFormRow>*/}
          <EuiSpacer size="s" />
          <EuiFormRow label="Rollup interval" isInvalid={!!rollupIdError} error={rollupIdError}>
            <EuiSelect
              id="selectDocExample"
              options={timeUnitOptions}
              // value={value}
              // onChange={onChange}
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
