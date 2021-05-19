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
import { DelayTimeunitOptions, ExecutionFrequencyDefinitionOptions, ScheduleIntervalTimeunitOptions } from "../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";
import { selectInterval } from "../../../Transforms/utils/metadataHelper";

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
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="m">
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

          {/* TODO: Removing transform execution frequency dropdown menu as only fix interval will be supported in P0. */}
          {/*<EuiFormRow label="Transform execution frequency">*/}
          {/*  <EuiSelect id="continuousDefinition" options={ExecutionFrequencyDefinitionOptions} />*/}
          {/*</EuiFormRow>*/}
          {/*<EuiSpacer size="m" />*/}

          {/* TODO: Replace with switch block when define by cron expressions is supported. */}
          {selectInterval(interval, intervalTimeunit, intervalError, onChangeIntervalTime, onChangeIntervalTimeunit)}

          <EuiHorizontalRule />
          <EuiAccordion
            id="pagePerExecution"
            buttonContent={
              <EuiText>
                <h3>Advanced</h3>
              </EuiText>
            }
          >
            <EuiSpacer size="m" />
            <EuiFormRow
              label="Pages per execution"
              helpText={`Determines the number of transformed buckets that are
                        computed and indexed at a time. A larger number means
                        better throughput for each search request, but costs
                        more memory and incurs higher latency. An exception
                        occurs when memory limits are exceeded. We recommend
                        you to start with the default value, and adjust based
                        on your use case and shard size.`}
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
