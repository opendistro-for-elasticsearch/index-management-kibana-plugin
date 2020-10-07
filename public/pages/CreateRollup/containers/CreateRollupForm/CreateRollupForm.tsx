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

import React, { ChangeEvent, Component, Fragment } from "react";
import { EuiSpacer, EuiCallOut, EuiLink, EuiIcon } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, DOCUMENTATION_URL, ROUTES } from "../../../../utils/constants";
import IndexService from "../../../../services/IndexService";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import CreateRollup from "../CreateRollup";
import CreateRollupStep2 from "../CreateRollupStep2";
import { toastNotifications } from "ui/notify";
import { Rollup } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { DEFAULT_ROLLUP } from "../../utils/constants";

interface CreateRollupFormProps extends RouteComponentProps {
  rollupService: RollupService;
  indexService: IndexService;
}

interface CreateRollupFormState {
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
  currentStep: number;
}

export default class CreateRollupForm extends Component<CreateRollupFormProps, CreateRollupFormState> {
  constructor(props: CreateRollupFormProps) {
    super(props);

    this.state = {
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
      currentStep: 1,
    };
    this._next = this._next.bind(this);
    this._prev = this._prev.bind(this);
    this.onChange = this.onChange.bind(this);
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

  get previousButton() {
    let currentStep = this.state.currentStep;
    // If the current step is not 1, then render the "previous" button
    if (currentStep !== 1) {
      return (
        <button className="btn btn-secondary" type="button" onClick={this._prev}>
          Previous
        </button>
      );
    }
    return null;
  }

  get nextButton() {
    let currentStep = this.state.currentStep;
    // If the current step is not 3, then render the "next" button
    if (currentStep < 4) {
      return (
        <button className="btn btn-primary float-right" type="button" onClick={this._next}>
          Next
        </button>
      );
    }
    return null;
  }

  //TODO: Go back to rollup jobs page when cancelled
  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
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

  onSubmit = async (): Promise<void> => {
    const { rollupId } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!rollupId) {
        this.setState({ rollupIdError: "Required" });
      } else {
        //TODO: Build JSON string here
        const rollup = DEFAULT_ROLLUP;
        await this.onCreate(rollupId, rollup);
      }
    } catch (err) {
      toastNotifications.addDanger("Invalid Policy JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  renderEditCallOut = (): React.ReactNode | null => {
    return (
      <Fragment>
        <EuiCallOut
          title="Edits to the rollup are not automatically applied to indices that are already being managed by this rollup."
          iconType="questionInCircle"
        >
          <p>
            This ensures that any update to a rollup doesn't harm indices that are running under an older version of the rollup. To carry
            over your edits to these indices, please use the "Change Rollup" under "Managed Indices" to reapply the rollup after submitting
            your edits.{" "}
            <EuiLink href={DOCUMENTATION_URL} target="_blank">
              Learn more <EuiIcon type="popout" size="s" />
            </EuiLink>
          </p>
        </EuiCallOut>
        <EuiSpacer />
      </Fragment>
    );
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <CreateRollup {...this.props} />
        <CreateRollupStep2 {...this.props} />
        {this.previousButton}
        {this.nextButton}
      </form>
    );
  }
}
