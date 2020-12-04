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
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { CoreStart } from "kibana/public";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { Rollup } from "../../../../../models/interfaces";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import Schedule from "../../components/Schedule";
import { CoreServicesContext } from "../../../../components/core_services";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  currentStep: number;
  jobEnabledByDefault: boolean;
  continuousJob: string;
  continuousDefinition: string;
  interval: number;
  intervalTimeunit: string;
  intervalError: string;
  cronExpression: string;
  cronTimezone: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  onChangeJobEnabledByDefault: () => void;
  onChangeCron: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeCronTimezone: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeDelayTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeIntervalTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangePage: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeContinuousDefinition: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeContinuousJob: (optionId: string) => void;
  onChangeDelayTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeIntervalTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
}

interface CreateRollupState {
  rollupId: string;
  rollupIdError: string;
  rollupSeqNo: number | null;
  rollupPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

export default class CreateRollupStep3 extends Component<CreateRollupProps, CreateRollupState> {
  core = React.useContext(CoreServicesContext) as CoreStart;
  constructor(props: CreateRollupProps) {
    super(props);

    this.state = {
      rollupSeqNo: null,
      rollupPrimaryTerm: null,
      rollupId: "",
      rollupIdError: "",
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    this.core.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
  };

  onCreate = async (rollupId: string, rollup: Rollup): Promise<void> => {
    const { rollupService } = this.props;
    try {
      const response = await rollupService.putRollup(rollup, rollupId);
      if (response.ok) {
        this.core.notifications.toasts.addSuccess(`Created rollup: ${response.response._id}`);
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
        this.core.notifications.toasts.addDanger("Could not update rollup without seqNo and primaryTerm");
        return;
      }
      const response = await rollupService.putRollup(rollup, rollupId, rollupSeqNo, rollupPrimaryTerm);
      if (response.ok) {
        this.core.notifications.toasts.addSuccess(`Updated rollup: ${response.response._id}`);
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

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const rollupId = e.target.value;
    if (hasSubmitted) this.setState({ rollupId, rollupIdError: rollupId ? "" : "Required" });
    else this.setState({ rollupId });
  };

  render() {
    if (this.props.currentStep != 3) return null;
    const {
      jobEnabledByDefault,
      continuousJob,
      continuousDefinition,
      interval,
      intervalTimeunit,
      cronExpression,
      pageSize,
      delayTime,
      delayTimeunit,
      onChangeJobEnabledByDefault,
      onChangeCron,
      onChangeDelayTime,
      onChangeIntervalTime,
      onChangePage,
      onChangeContinuousDefinition,
      onChangeContinuousJob,
      onChangeDelayTimeunit,
      onChangeIntervalTimeunit,
    } = this.props;
    const { rollupId, rollupIdError } = this.state;
    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={3} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Specify schedule</h1>
            </EuiTitle>
            <EuiSpacer />
            <Schedule
              {...this.props}
              isEdit={false}
              rollupId={rollupId}
              rollupIdError={rollupIdError}
              jobEnabledByDefault={jobEnabledByDefault}
              continuousJob={continuousJob}
              continuousDefinition={continuousDefinition}
              interval={interval}
              intervalTimeunit={intervalTimeunit}
              cronExpression={cronExpression}
              pageSize={pageSize}
              delayTime={delayTime}
              delayTimeunit={delayTimeunit}
              onChangeJobEnabledByDefault={onChangeJobEnabledByDefault}
              onChangeCron={onChangeCron}
              onChangeDelayTime={onChangeDelayTime}
              onChangeIntervalTime={onChangeIntervalTime}
              onChangePage={onChangePage}
              onChangeContinuousDefinition={onChangeContinuousDefinition}
              onChangeContinuousJob={onChangeContinuousJob}
              onChangeDelayTimeunit={onChangeDelayTimeunit}
              onChangeIntervalTimeunit={onChangeIntervalTimeunit}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
