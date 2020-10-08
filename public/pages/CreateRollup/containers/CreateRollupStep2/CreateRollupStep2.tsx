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
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiCallOut, EuiComboBoxOptionOption } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import TimeAggregation from "../../components/TimeAggregations";
import AdvancedAggregation from "../../components/AdvancedAggregation";
import MetricsCalculation from "../../components/MetricsCalculation";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  currentStep: number;
  intervalType: string;
  timestampOptions: EuiComboBoxOptionOption<String>[];
  selectedTimestamp: EuiComboBoxOptionOption<String>[];
  onChangeIntervalType: (optionId: string) => void;
  onChangeTimestamp: (options: EuiComboBoxOptionOption<String>[]) => void;
  onChangeTimezone: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  timezone: string;
  timeunit: string;
}

//TODO: Fetch actual timestamp options from backend
const options: EuiComboBoxOptionOption<String>[] = [
  {
    label: "timestamp1",
  },
  {
    label: "timestamp2",
  },
  {
    label: "timestamp3",
  },
];

export default class CreateRollupStep2 extends Component<CreateRollupProps> {
  constructor(props: CreateRollupProps) {
    super(props);
  }

  onChangeIntervalType = (optionId: string): void => {
    this.setState({ intervalType: optionId });
  };

  onChangeTimestamp = (selectedOptions: EuiComboBoxOptionOption<String>[]): void => {
    this.setState({ timestamp: selectedOptions });
  };

  onChangeTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ timeunit: e.target.value });
  };

  onChangeTimezone = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ timezone: e.target.value });
  };

  render() {
    if (this.props.currentStep !== 2) return null;

    const {
      intervalType,
      selectedTimestamp,
      timezone,
      timeunit,
      onChangeTimestamp,
      onChangeTimezone,
      onChangeIntervalType,
      onChangeTimeunit,
    } = this.props;

    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={2} />
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Define aggregations and metrics</h1>
            </EuiTitle>
            <EuiSpacer />
            <EuiCallOut color="warning">
              <p>
                Aggregations and metrics cannot be changed once the job is created. Please ensure that you select correct fields and
                metrics.
              </p>
            </EuiCallOut>
            <EuiSpacer />
            <TimeAggregation
              onChangeTimestamp={onChangeTimestamp}
              timestampOptions={options}
              onChangeIntervalType={onChangeIntervalType}
              intervalType={intervalType}
              selectedTimestamp={selectedTimestamp}
              timezone={timezone}
              timeunit={timeunit}
              onChangeTimezone={onChangeTimezone}
              onChangeTimeunit={onChangeTimeunit}
            />
            <EuiSpacer />
            <AdvancedAggregation {...this.props} />
            <EuiSpacer />
            <MetricsCalculation {...this.props} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
