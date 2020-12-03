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
import { RouteComponentProps } from "react-router-dom";
import moment from "moment";
import queryString from "query-string";
import { EuiFlexItem, EuiFlexGroup, EuiButton, EuiTitle, EuiSpacer, EuiButtonEmpty } from "@elastic/eui";
import { CoreStart } from "kibana/public";
import ConfigureRollup from "../../CreateRollup/components/ConfigureRollup";
import Schedule from "../../CreateRollup/components/Schedule";
import { getErrorMessage } from "../../../utils/helpers";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { Rollup } from "../../../../models/interfaces";
import { RollupService } from "../../../services";
import { EMPTY_ROLLUP } from "../../CreateRollup/utils/constants";

interface EditRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  core: CoreStart;
}

interface EditRollupState {
  rollupId: string;
  rollupIdError: string;
  rollupSeqNo: number | null;
  rollupPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  jobEnabledByDefault: boolean;
  continuousJob: string;
  continuousDefinition: string;
  interval: number;
  intervalError: string;
  intervalTimeunit: string;
  cronExpression: string;
  cronTimezone: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  rollupJSON: any;
}

export default class EditRollup extends Component<EditRollupProps, EditRollupState> {
  constructor(props: EditRollupProps) {
    super(props);
    this.state = {
      rollupId: "",
      rollupIdError: "",
      rollupSeqNo: null,
      rollupPrimaryTerm: null,
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
      description: "",
      jobEnabledByDefault: false,
      continuousJob: "no",
      continuousDefinition: "fixed",
      interval: 2,
      intervalError: "",
      intervalTimeunit: "MINUTES",
      cronExpression: "",
      cronTimezone: "UTC",
      pageSize: 1000,
      delayTime: undefined,
      delayTimeunit: "MINUTES",
      rollupJSON: EMPTY_ROLLUP,
    };
  }

  componentDidMount = async (): Promise<void> => {
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string" && !!id) {
      this.props.core.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS, BREADCRUMBS.EDIT_ROLLUP, { text: id }]);
      await this.getRollupToEdit(id);
    } else {
      this.props.core.notifications.toasts.addDanger(`Invalid rollup id: ${id}`);
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  getRollupToEdit = async (rollupId: string): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const response = await rollupService.getRollup(rollupId);

      if (response.ok) {
        let newJSON = JSON.parse(this.state.rollupJSON);
        newJSON.rollup = response.response.rollup;

        this.setState({
          rollupSeqNo: response.response._seqNo,
          rollupPrimaryTerm: response.response._primaryTerm,
          rollupId: response.response._id,
          description: response.response.rollup.description,
          jobEnabledByDefault: response.response.rollup.enabled,
          pageSize: response.response.rollup.page_size,
          delayTime: response.response.rollup.delay == 0 ? "" : response.response.rollup.delay,
          rollupJSON: newJSON,
        });
        if (response.response.rollup.schedule.cron == undefined) {
          this.setState({
            interval: response.response.rollup.schedule.interval.period,
            intervalTimeunit: response.response.rollup.schedule.interval.unit,
            continuousDefinition: "fixed",
          });
        } else {
          this.setState({ cronExpression: response.response.rollup.schedule.cron.expression, continuousDefinition: "cron" });
        }
      } else {
        this.props.core.notifications.toasts.addDanger(`Could not load the rollup job: ${response.error}`);
        this.props.history.push(ROUTES.ROLLUPS);
      }
    } catch (err) {
      this.props.core.notifications.toasts.addDanger(getErrorMessage(err, "Could not load the rollup job"));
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.description = description;
    this.setState({ description: description, rollupJSON: newJSON });
  };

  onChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const rollupId = e.target.value;
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.rollupId = rollupId;
    if (hasSubmitted) this.setState({ rollupId, rollupIdError: rollupId ? "" : "Required" });
    else this.setState({ rollupId: rollupId, rollupJSON: newJSON });
  };

  onChangeJobEnabledByDefault = (): void => {
    const checked = this.state.jobEnabledByDefault;
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.enabled = checked;
    this.setState({ jobEnabledByDefault: !checked, rollupJSON: newJSON });
  };

  onChangeCron = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ cronExpression: e.target.value });
  };

  onChangeCronTimezone = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ cronTimezone: e.target.value });
  };

  onChangeDelayTime = (e: ChangeEvent<HTMLInputElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.delay = e.target.value;
    this.setState({ delayTime: e.target.valueAsNumber, rollupJSON: newJSON });
  };

  onChangeIntervalTime = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ interval: e.target.valueAsNumber });
    if (e.target.value == "") {
      const intervalErrorMsg = "Interval value is required.";
      this.setState({ submitError: intervalErrorMsg, intervalError: intervalErrorMsg });
    } else {
      this.setState({ intervalError: "" });
    }
  };

  onChangePage = (e: ChangeEvent<HTMLInputElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.page_size = e.target.value;
    this.setState({ pageSize: e.target.valueAsNumber, rollupJSON: newJSON });
  };

  onChangeContinuousDefinition = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ continuousDefinition: e.target.value });
  };

  onChangeContinuousJob = (optionId: string): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.continuous = optionId == "yes";
    this.setState({ continuousJob: optionId, rollupJSON: newJSON });
  };

  //Update delay field in JSON if delay value is defined.
  onChangeDelayTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ delayTimeunit: e.target.value });
  };

  onChangeIntervalTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ intervalTimeunit: e.target.value });
  };

  updateSchedule = (): void => {
    const { continuousDefinition, cronExpression, interval, intervalTimeunit, cronTimezone } = this.state;
    let newJSON = this.state.rollupJSON;

    if (continuousDefinition == "cron") {
      newJSON.rollup.schedule.cron = { expression: `${cronExpression}`, timezone: `${cronTimezone}` };
      delete newJSON.rollup.schedule["interval"];
    } else {
      newJSON.rollup.schedule.interval = {
        start_time: moment().unix(),
        unit: intervalTimeunit,
        period: interval,
      };
      delete newJSON.rollup.schedule["cron"];
    }
    this.setState({ rollupJSON: newJSON });
  };

  onSubmit = async (): Promise<void> => {
    const { rollupId, rollupJSON } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!rollupId) {
        this.setState({ rollupIdError: "Required" });
      } else {
        //Build JSON string here
        this.updateSchedule();
        await this.onUpdate(rollupId, rollupJSON);
      }
    } catch (err) {
      this.props.core.notifications.toasts.addDanger("Invalid Rollup JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  onUpdate = async (rollupId: string, rollup: Rollup): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const { rollupPrimaryTerm, rollupSeqNo } = this.state;
      if (rollupSeqNo == null || rollupPrimaryTerm == null) {
        this.props.core.notifications.toasts.addDanger("Could not update rollup without seqNo and primaryTerm");
        return;
      }
      const response = await rollupService.putRollup(rollup, rollupId, rollupSeqNo, rollupPrimaryTerm);
      if (response.ok) {
        this.props.core.notifications.toasts.addSuccess(`Changes to "${response.response._id}" saved!`);
        this.props.history.push(ROUTES.ROLLUPS);
      } else {
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem updating the rollup") });
    }
  };

  render() {
    const {
      rollupId,
      rollupIdError,
      isSubmitting,
      description,
      jobEnabledByDefault,
      continuousJob,
      continuousDefinition,
      interval,
      intervalError,
      intervalTimeunit,
      cronExpression,
      cronTimezone,
      pageSize,
      delayTime,
      delayTimeunit,
    } = this.state;
    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>Edit rollup job</h1>
        </EuiTitle>
        <EuiSpacer />
        <ConfigureRollup
          isEdit={true}
          rollupId={rollupId}
          rollupIdError={rollupIdError}
          onChangeDescription={this.onChangeDescription}
          onChangeName={this.onChangeName}
          description={description}
        />
        <EuiSpacer />
        <Schedule
          isEdit={true}
          rollupId={rollupId}
          rollupIdError={rollupIdError}
          jobEnabledByDefault={jobEnabledByDefault}
          continuousJob={continuousJob}
          continuousDefinition={continuousDefinition}
          interval={interval}
          intervalTimeunit={intervalTimeunit}
          cronExpression={cronExpression}
          cronTimezone={cronTimezone}
          pageSize={pageSize}
          intervalError={intervalError}
          delayTime={delayTime}
          delayTimeunit={delayTimeunit}
          onChangeJobEnabledByDefault={this.onChangeJobEnabledByDefault}
          onChangeCron={this.onChangeCron}
          onChangeCronTimezone={this.onChangeCronTimezone}
          onChangeDelayTime={this.onChangeDelayTime}
          onChangeIntervalTime={this.onChangeIntervalTime}
          onChangePage={this.onChangePage}
          onChangeContinuousDefinition={this.onChangeContinuousDefinition}
          onChangeContinuousJob={this.onChangeContinuousJob}
          onChangeDelayTimeunit={this.onChangeDelayTimeunit}
          onChangeIntervalTimeunit={this.onChangeIntervalTimeunit}
        />

        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="editRollupCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="editRollupSaveChangesButton">
              Save changes
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
