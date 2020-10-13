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

import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiCallOut, EuiComboBoxOptionOption } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { IndexItem } from "../../../../../models/interfaces";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import HistogramAndMetrics from "../../components/HistogramAndMetrics";
import JobNameAndIndices from "../../components/JobNameAndIndices";
import ScheduleRolesAndNotifications from "../../components/ScheduleRolesAndNotifications";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  submitError: string;
  currentStep: number;
  onChangeStep: (step: number) => void;
  rollupId: string;
  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  targetIndex: { label: string; value?: IndexItem }[];
  roles: EuiComboBoxOptionOption<String>[];

  timestamp: EuiComboBoxOptionOption<String>[];
  intervalValue: number;
  timezone: string;
  timeunit: string;

  jobEnabledByDefault: boolean;
  recurringJob: string;
  recurringDefinition: string;
  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
}

export default class CreateRollupStep4 extends Component<CreateRollupProps> {
  constructor(props: CreateRollupProps) {
    super(props);

    this.state = {
      rollupSeqNo: null,
      rollupPrimaryTerm: null,
      rollupIdError: "",
      submitError: "",
      jsonString: "",
      isSubmitting: false,
      hasSubmitted: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  render() {
    if (this.props.currentStep != 4) return null;
    const {
      rollupId,
      description,
      onChangeStep,
      submitError,
      sourceIndex,
      targetIndex,
      roles,
      intervalValue,
      timestamp,
      timezone,
      timeunit,
      jobEnabledByDefault,
      recurringJob,
      recurringDefinition,
      interval,
      intervalTimeunit,
      cronExpression,
      pageSize,
      delayTime,
      delayTimeunit,
    } = this.props;

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={4} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Review and create</h1>
            </EuiTitle>
            <EuiSpacer />
            <JobNameAndIndices
              rollupId={rollupId}
              description={description}
              sourceIndex={sourceIndex}
              targetIndex={targetIndex}
              roles={roles}
              onChangeStep={onChangeStep}
            />
            <EuiSpacer />
            <HistogramAndMetrics
              rollupId={rollupId}
              intervalValue={intervalValue}
              timestamp={timestamp}
              timeunit={timeunit}
              timezone={timezone}
              onChangeStep={onChangeStep}
            />
            <EuiSpacer />
            <ScheduleRolesAndNotifications
              rollupId={rollupId}
              jobEnabledByDefault={jobEnabledByDefault}
              recurringJob={recurringJob}
              recurringDefinition={recurringDefinition}
              interval={interval}
              intervalTimeunit={intervalTimeunit}
              cronExpression={cronExpression}
              pageSize={pageSize}
              delayTime={delayTime}
              delayTimeunit={delayTimeunit}
              onChangeStep={onChangeStep}
            />
            {submitError && (
              <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
                <p>{submitError}</p>
              </EuiCallOut>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
