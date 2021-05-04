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
import moment from "moment-timezone";
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
  EuiAccordion,
  EuiHorizontalRule,
} from "@elastic/eui";
import { DelayTimeunitOptions, ScheduleIntervalTimeunitOptions } from "../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ScheduleProps {
  isEdit: boolean;
  transformId: string;
  transformIdError: string;
  jobEnabledByDefault: boolean;
  pageSize: number;
  onChangeJobEnabledByDefault: () => void;
  interval: number;
  intervalTimeunit: string;
  intervalError: string;
  onChangeIntervalTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeIntervalTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangePage: (e: ChangeEvent<HTMLInputElement>) => void;
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
        <EuiFormRow label="Transform interval" error={intervalError} isInvalid={intervalError != ""}>
          <EuiFieldNumber value={interval} onChange={onChangeInterval} isInvalid={intervalError != ""} />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow hasEmptyLabelSpace={true}>
          <EuiSelect
            id="selectIntervalTimeunit"
            options={ScheduleIntervalTimeunitOptions}
            value={intervalTimeunit}
            onChange={onChangeTimeunit}
            isInvalid={interval == undefined || interval <= 0}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </React.Fragment>
);

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

export default class Schedule extends Component<ScheduleProps> {
  constructor(props: ScheduleProps) {
    super(props);
  }

  render() {
    const {
      isEdit,
      jobEnabledByDefault,
      interval,
      intervalTimeunit,
      intervalError,
      pageSize,
      onChangeJobEnabledByDefault,
      onChangeIntervalTime,
      onChangeIntervalTimeunit,
      onChangePage,
    } = this.props;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          {!isEdit && (
            <EuiCheckbox
              id="jobEnabledByDefault"
              label="Job enabled by default"
              checked={jobEnabledByDefault}
              onChange={onChangeJobEnabledByDefault}
              data-test-subj="jobEnabledByDefault"
            />
          )}
          <EuiSpacer size="m" />

          {!isEdit}

          <EuiFormRow label="Transform execution frequency">
            <EuiSelect id="continuousDefinition" options={[{ value: "fixed", text: "Define by fixed interval" }]} />
          </EuiFormRow>
          <EuiSpacer size="m" />

          {selectInterval(interval, intervalTimeunit, intervalError, onChangeIntervalTime, onChangeIntervalTimeunit)}

          <EuiHorizontalRule />
          <EuiAccordion id="pagePerExecution" buttonContent="Advanced">
            <EuiFormRow
              label="Page per execution"
              helpText="The number of pages every execution processes. A larger number means faster execution and higher costs on memory."
            >
              <EuiFieldNumber min={1} placeholder="1000" value={pageSize} onChange={onChangePage} />
            </EuiFormRow>
          </EuiAccordion>
          <EuiSpacer size="m" />
        </div>
      </ContentPanel>
    );
  }
}
