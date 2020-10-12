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
import { EuiButton, EuiButtonEmpty, EuiComboBoxOptionOption, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import IndexService from "../../../../services/IndexService";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import CreateRollup from "../CreateRollup";
import CreateRollupStep2 from "../CreateRollupStep2";
import { toastNotifications } from "ui/notify";
import { IndexItem, Rollup } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { EMPTY_ROLLUP } from "../../utils/constants";
import CreateRollupStep3 from "../CreateRollupStep3";
import CreateRollupStep4 from "../CreateRollupStep4";

interface CreateRollupFormProps extends RouteComponentProps {
  rollupService: RollupService;
  indexService: IndexService;
}

interface CreateRollupFormState {
  currentStep: number;
  rollupId: string;
  rollupIdError: string;
  rollupSeqNo: number | null;
  rollupPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  loadingIndices: boolean;
  indices: ManagedCatIndex[];
  totalIndices: number;

  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  roles: EuiComboBoxOptionOption<String>[];

  jobEnabledByDefault: boolean;
  recurringJob: string;
  recurringDefinition: string;
  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  rollupJSON: any;
}

//TODO: Fetch actual roles from backend
const options: EuiComboBoxOptionOption<String>[] = [
  {
    label: "Role1",
  },
  {
    label: "Role2",
  },
  {
    label: "Role3",
  },
];

export default class CreateRollupForm extends Component<CreateRollupFormProps, CreateRollupFormState> {
  constructor(props: CreateRollupFormProps) {
    super(props);

    this.state = {
      currentStep: 1,
      rollupSeqNo: null,
      rollupPrimaryTerm: null,
      rollupId: "",
      rollupIdError: "",
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
      loadingIndices: true,
      indices: [],
      totalIndices: 0,

      description: "",
      sourceIndex: [],
      sourceIndexError: "",
      targetIndex: [],
      roles: [],

      jobEnabledByDefault: false,
      recurringJob: "no",
      recurringDefinition: "fixed",
      interval: 2,
      intervalTimeunit: "M",
      cronExpression: "",
      pageSize: 1000,
      delayTime: undefined,
      delayTimeunit: "MINUTES",
      rollupJSON: JSON.parse(EMPTY_ROLLUP),
    };
    this._next = this._next.bind(this);
    this._prev = this._prev.bind(this);
    // this.onChange = this.onChange.bind(this);
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    chrome.breadcrumbs.push(BREADCRUMBS.CREATE_ROLLUP);
  };

  _next() {
    let currentStep = this.state.currentStep;
    //Verification here
    if (currentStep == 1) {
      const { rollupId, sourceIndex, targetIndex } = this.state;
      if (!rollupId) {
        this.setState({ submitError: "Job name is required." });
        return;
      } else if (sourceIndex.length == 0) {
        this.setState({ submitError: "Source index is required." });
        return;
      } else if (targetIndex.length == 0) {
        this.setState({ submitError: "Target index is required." });
        return;
      }
    }
    currentStep = currentStep >= 3 ? 4 : currentStep + 1;

    this.setState({
      submitError: "",
      currentStep: currentStep,
    });
  }

  _prev() {
    let currentStep = this.state.currentStep;
    // If the current step is 2 or 3, then subtract one on "previous" button click
    currentStep = currentStep <= 1 ? 1 : currentStep - 1;
    this.setState({
      currentStep: currentStep,
    });
  }

  onChangeStep = (step: number): void => {
    if (step > 3) return;
    this.setState({
      currentStep: step,
    });
  };

  //TODO: Go back to rollup jobs page when cancelled
  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
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
      this.setState({ submitError: getErrorMessage(err, "There was a problem creating the rollup job") });
    }
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.description = description;
    this.setState({ description: description, rollupJSON: newJSON });
    console.log(this.state);
  };

  onChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const rollupId = e.target.value;
    if (hasSubmitted) this.setState({ rollupId, rollupIdError: rollupId ? "" : "Required" });
    else this.setState({ rollupId });
  };

  onChangeSourceIndex = (options: EuiComboBoxOptionOption<IndexItem>[]): void => {
    //Try to get label text from option from the only array element in options if exists
    let newJSON = this.state.rollupJSON;
    let sourceIndex = options.map(function (option) {
      return option.label;
    });
    const sourceIndexError = sourceIndex.length ? "" : "Required";

    newJSON.rollup.source_index = sourceIndex[0];
    this.setState({ sourceIndex: options, rollupJSON: newJSON, sourceIndexError: sourceIndexError });
  };

  onChangeTargetIndex = (options: EuiComboBoxOptionOption<IndexItem>[]): void => {
    //Try to get label text from option from the only array element in options if exists
    let newJSON = this.state.rollupJSON;
    let targetIndex = options.map(function (option) {
      return option.label;
    });
    const rollupError = targetIndex.length ? "" : "Required";

    newJSON.rollup.target_index = targetIndex[0];
    this.setState({ targetIndex: options, rollupJSON: newJSON, rollupIdError: rollupError });
  };

  onChangeRoles = (selectedOptions: EuiComboBoxOptionOption<String>[]): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.roles = selectedOptions.map(function (option) {
      return option.label;
    });
    this.setState({ roles: selectedOptions, rollupJSON: newJSON });
  };

  onChangeJobEnabledByDefault = (): void => {
    const checked = this.state.jobEnabledByDefault;
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.enabled = checked;
    this.setState({ jobEnabledByDefault: !checked, rollupJSON: newJSON });
  };

  onChangeCron = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.schedule.cron.expression = e.target.value;
    this.setState({ cronExpression: e.target.value, rollupJSON: newJSON });
  };

  //TODO: Figure out the correct format of delay time, do we need to convert the value along with timeunit?
  onChangeDelayTime = (e: ChangeEvent<HTMLInputElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.delay = e.target.value;
    this.setState({ delayTime: e.target.valueAsNumber, rollupJSON: newJSON });
  };

  onChangeIntervalTime = (e: ChangeEvent<HTMLInputElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.schedule.interval.period = e.target.value;
    this.setState({ interval: e.target.valueAsNumber, rollupJSON: newJSON });
  };

  onChangePage = (e: ChangeEvent<HTMLInputElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.page_size = e.target.value;
    this.setState({ pageSize: e.target.valueAsNumber, rollupJSON: newJSON });
  };

  //Trying to clear interval field when cron expression is defined
  onChangeRecurringDefinition = (e: ChangeEvent<HTMLSelectElement>): void => {
    let newJSON = this.state.rollupJSON;
    this.setState({ recurringDefinition: e.target.value, rollupJSON: newJSON });
  };

  onChangeRecurringJob = (optionId: string): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.continuous = optionId == "yes";
    this.setState({ recurringJob: optionId, rollupJSON: newJSON });
  };

  //Update delay field in JSON if delay value is defined.
  onChangeDelayTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ delayTimeunit: e.target.value });
  };

  onChangeIntervalTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.schedule.interval.unit = e.target.value;
    this.setState({ intervalTimeunit: e.target.value, rollupJSON: newJSON });
  };

  //TODO: Complete submit logistic
  onSubmit = async (): Promise<void> => {
    const { rollupId, rollupJSON } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!rollupId) {
        this.setState({ rollupIdError: "Required" });
      } else {
        //TODO: Build JSON string here
        await this.onCreate(rollupId, rollupJSON);
      }
    } catch (err) {
      toastNotifications.addDanger("Invalid Policy JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  render() {
    const {
      rollupId,
      rollupIdError,
      submitError,
      isSubmitting,
      hasSubmitted,
      description,
      sourceIndex,
      sourceIndexError,
      targetIndex,
      roles,
      currentStep,
      jobEnabledByDefault,
      recurringJob,
      recurringDefinition,
      interval,
      intervalTimeunit,
      cronExpression,
      pageSize,
      delayTime,
      delayTimeunit,
    } = this.state;
    return (
      <form onSubmit={this.onSubmit}>
        <CreateRollup
          {...this.props}
          rollupId={rollupId}
          rollupIdError={rollupIdError}
          submitError={submitError}
          isSubmitting={isSubmitting}
          hasSubmitted={hasSubmitted}
          description={description}
          sourceIndex={sourceIndex}
          sourceIndexError={sourceIndexError}
          targetIndex={targetIndex}
          roles={roles}
          onChangeRoles={this.onChangeRoles}
          roleOptions={options}
          onChangeName={this.onChangeName}
          onChangeDescription={this.onChangeDescription}
          onChangeSourceIndex={this.onChangeSourceIndex}
          onChangeTargetIndex={this.onChangeTargetIndex}
          currentStep={this.state.currentStep}
        />
        <CreateRollupStep2 {...this.props} currentStep={this.state.currentStep} />
        <CreateRollupStep3
          {...this.props}
          currentStep={this.state.currentStep}
          jobEnabledByDefault={jobEnabledByDefault}
          recurringJob={recurringJob}
          recurringDefinition={recurringDefinition}
          interval={interval}
          intervalTimeunit={intervalTimeunit}
          cronExpression={cronExpression}
          pageSize={pageSize}
          delayTime={delayTime}
          delayTimeunit={delayTimeunit}
          onChangeJobEnabledByDefault={this.onChangeJobEnabledByDefault}
          onChangeCron={this.onChangeCron}
          onChangeDelayTime={this.onChangeDelayTime}
          onChangeIntervalTime={this.onChangeIntervalTime}
          onChangePage={this.onChangePage}
          onChangeRecurringDefinition={this.onChangeRecurringDefinition}
          onChangeRecurringJob={this.onChangeRecurringJob}
          onChangeDelayTimeunit={this.onChangeDelayTimeunit}
          onChangeIntervalTimeunit={this.onChangeIntervalTimeunit}
        />
        <CreateRollupStep4
          {...this.props}
          rollupId={rollupId}
          description={description}
          currentStep={this.state.currentStep}
          onChangeStep={this.onChangeStep}
          submitError={submitError}
        />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd" style={{ padding: "5px 50px" }}>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createRollupCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          {currentStep != 1 && (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this._prev} isLoading={isSubmitting} data-test-subj="createRollupPreviousButton">
                {"Previous"}
              </EuiButton>
            </EuiFlexItem>
          )}

          {currentStep == 4 ? (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="createRollupSubmitButton">
                {"Submit"}
              </EuiButton>
            </EuiFlexItem>
          ) : (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this._next} isLoading={isSubmitting} data-test-subj="createRollupNextButton">
                {"Next"}
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </form>
    );
  }
}
