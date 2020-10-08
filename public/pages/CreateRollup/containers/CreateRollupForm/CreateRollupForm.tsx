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
import { Rollup } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { DEFAULT_ROLLUP } from "../../utils/constants";
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
  roles: EuiComboBoxOptionOption<String>[];
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
      roles: [],
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
    currentStep = currentStep >= 3 ? 4 : currentStep + 1;
    this.setState({
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

  // onChange = (e: ChangeEvent<HTMLInputElement>): void => {
  //   const {name, value} = e.target;
  //   this.setState({
  //     [name]: value,
  //   });
  // };

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
    this.setState({ description });
    console.log(this.state);
  };

  onChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const rollupId = e.target.value;
    if (hasSubmitted) this.setState({ rollupId, rollupIdError: rollupId ? "" : "Required" });
    else this.setState({ rollupId });
  };

  onChangeRoles = (selectedOptions: EuiComboBoxOptionOption<String>[]): void => {
    this.setState({ roles: selectedOptions });
  };

  //TODO: Complete submit logistic
  onSubmit = async (): Promise<void> => {
    const { rollupId } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!rollupId) {
        this.setState({ rollupIdError: "Required" });
      } else {
        //TODO: Build JSON string here
        const rollup = DEFAULT_ROLLUP;
        // await this.onCreate(rollupId, rollup);
      }
    } catch (err) {
      toastNotifications.addDanger("Invalid Policy JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  render() {
    const { rollupId, rollupIdError, submitError, isSubmitting, hasSubmitted, description, roles, currentStep } = this.state;
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
          roles={roles}
          onChangeRoles={this.onChangeRoles}
          roleOptions={options}
          onChangeDescription={this.onChangeDescription}
          onChange={this.onChangeName}
          currentStep={this.state.currentStep}
        />
        <CreateRollupStep2 {...this.props} currentStep={this.state.currentStep} />
        <CreateRollupStep3 {...this.props} currentStep={this.state.currentStep} />
        <CreateRollupStep4 {...this.props} currentStep={this.state.currentStep} onChangeStep={this.onChangeStep} />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd" style={{ padding: "25px 50px" }}>
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
