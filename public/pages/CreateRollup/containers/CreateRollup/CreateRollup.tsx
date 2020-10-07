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
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty, EuiCallOut, EuiLink, EuiIcon } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, DOCUMENTATION_URL, ROUTES } from "../../../../utils/constants";
import ConfigureRollup from "../../components/ConfigureRollup";
import RollupIndices from "../../components/RollupIndices";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import Roles from "../../components/Roles";
import IndexService from "../../../../services/IndexService";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  indexService: IndexService;
}

interface CreateRollupState {
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
}

export default class CreateRollup extends Component<CreateRollupProps, CreateRollupState> {
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
      loadingIndices: true,
      indices: [],
      totalIndices: 0,
      description: "",
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    chrome.breadcrumbs.push(BREADCRUMBS.CREATE_ROLLUP);
  };

  // getIndices = async (): Promise<void> => {
  //   this.setState({ loadingIndices: true });
  //   try {
  //     const { indexService, history } = this.props;
  //     const queryParamsString = queryString.stringify(Indices.getQueryObjectFromState(this.state));
  //     history.replace({ ...this.props.location, search: queryParamsString });
  //     const getIndicesResponse = await indexService.getIndices(queryParamsString);
  //     if (getIndicesResponse.ok) {
  //       const { indices, totalIndices } = getIndicesResponse.response;
  //       this.setState({ indices, totalIndices });
  //     } else {
  //       toastNotifications.addDanger(getIndicesResponse.error);
  //     }
  //   } catch (err) {
  //     toastNotifications.addDanger(getErrorMessage(err, "There was a problem loading the indices"));
  //   }
  //   this.setState({ loadingIndices: false });
  // };

  //TODO: Go back to rollup jobs page when cancelled
  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const rollupId = e.target.value;
    if (hasSubmitted) this.setState({ rollupId, rollupIdError: rollupId ? "" : "Required" });
    else this.setState({ rollupId });
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    this.setState({ description });
  };

  onNext = (): void => {
    console.log(this.state);
    this.props.history.push(ROUTES.CREATE_ROLLUP_STEP2);
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
    const { rollupId, rollupIdError, submitError, isSubmitting, description } = this.state;
    // Will be used later on for DefineRollup job (similar to DefinePolicy)

    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={1} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Set up Indices</h1>
            </EuiTitle>
            <EuiSpacer />
            <ConfigureRollup
              rollupId={rollupId}
              rollupIdError={rollupIdError}
              description={description}
              onChange={this.onChange}
              onChangeDescription={this.onChangeDescription}
            />
            <EuiSpacer />
            <RollupIndices rollupId={rollupId} rollupIdError={rollupIdError} onChange={this.onChange} />
            <EuiSpacer />
            <Roles rollupId={rollupId} rollupIdError={rollupIdError} onChange={this.onChange} />
            {submitError && (
              <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
                <p>{submitError}</p>
              </EuiCallOut>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createRollupCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onNext} isLoading={isSubmitting} data-test-subj="createRollupStep1NextButton">
              {"Next"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
