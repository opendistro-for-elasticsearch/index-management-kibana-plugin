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
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import chrome from "ui/chrome";
import { toastNotifications } from "ui/notify";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { Rollup } from "../../../../../models/interfaces";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import HistogramAndMetrics from "../../components/HistogramAndMetrics";
import JobNameAndIndices from "../../components/JobNameAndIndices";
import ScheduleRolesAndNotifications from "../../components/ScheduleRolesAndNotifications";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  currentStep: number;
  onChangeStep: (step: number) => void;
  rollupId: string;
  description: string;
}

interface CreateRollupState {
  rollupIdError: string;
  jsonString: string;
  rollupSeqNo: number | null;
  rollupPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

export default class CreateRollupStep4 extends Component<CreateRollupProps, CreateRollupState> {
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

  onCreate = async (rollupId: string, rollup: Rollup): Promise<void> => {
    const { rollupService } = this.props;
    try {
      const response = await rollupService.putRollup(rollup, rollupId);
      if (response.ok) {
        toastNotifications.addSuccess(`Created rollup: ${response.response._id}`);
        this.props.history.push(ROUTES.ROLLUPS);
      } else {
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem creating the rollup") });
    }
  };

  onUpdate = async (rollupId: string, rollup: Rollup): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const { rollupPrimaryTerm, rollupSeqNo } = this.state;
      if (rollupSeqNo == null || rollupPrimaryTerm == null) {
        toastNotifications.addDanger("Could not update rollup without seqNo and primaryTerm");
        return;
      }
      const response = await rollupService.putRollup(rollup, rollupId, rollupSeqNo, rollupPrimaryTerm);
      if (response.ok) {
        toastNotifications.addSuccess(`Updated rollup: ${response.response._id}`);
        this.props.history.push(ROUTES.ROLLUPS);
      } else {
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem updating the rollup") });
    }
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  render() {
    if (this.props.currentStep != 4) return null;
    const { rollupId, description, onChangeStep } = this.props;
    const { rollupIdError } = this.state;

    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={4} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Review and create</h1>
            </EuiTitle>
            <EuiSpacer />
            <JobNameAndIndices rollupId={rollupId} description={description} rollupIdError={rollupIdError} onChangeStep={onChangeStep} />
            <EuiSpacer />
            <HistogramAndMetrics rollupId={rollupId} rollupIdError={rollupIdError} onChangeStep={onChangeStep} />
            <EuiSpacer />
            <ScheduleRolesAndNotifications rollupId={rollupId} rollupIdError={rollupIdError} onChangeStep={onChangeStep} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
