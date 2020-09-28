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
import { EuiSpacer, EuiCheckbox, EuiRadioGroup } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ScheduleProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface ScheduleState {
  checked: boolean;
  radioIdSelected: string;
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

export default class Schedule extends Component<ScheduleProps, ScheduleState> {
  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      checked: false,
      radioIdSelected: "no",
    };
  }

  onChangeCheck = (): void => {
    const checked = this.state.checked;
    this.setState({ checked: !checked });
  };

  onChangeRadio = (optionId: string): void => {
    this.setState({ radioIdSelected: optionId });
  };

  render() {
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiCheckbox id="jobEnabledByDefault" label="Job enabled by default" checked={this.state.checked} onChange={this.onChangeCheck} />
          <EuiSpacer size="m" />
          <EuiRadioGroup
            options={radios}
            idSelected={this.state.radioIdSelected}
            onChange={(id) => this.onChangeRadio(id)}
            name="recurringJob"
            legend={{
              children: <span>Recurring job</span>,
            }}
          />
        </div>
      </ContentPanel>
    );
  }
}
