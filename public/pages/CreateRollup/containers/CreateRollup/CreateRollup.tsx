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
import { DEFAULT_ROLLUP } from "../../utils/constants";
import Roles from "../../components/Roles";
import { toastNotifications } from "ui/notify";
import { getErrorMessage } from "../../../../utils/helpers";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import _ from "lodash";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface CreateRollupState {
  rollupId: string;
  rollupIdError: string;
  jsonString: string;
  rollupSeqNo: number | null;
  rollupPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  loadingIndices: boolean;
  indices: ManagedCatIndex[];
  totalIndices: number;
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
      jsonString: "",
      isSubmitting: false,
      hasSubmitted: false,
      loadingIndices: true,
      indices: [],
      totalIndices: 0,
    };

    this.getIndices = _.debounce(this.getIndices, 500, { leading: true });
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    chrome.breadcrumbs.push(BREADCRUMBS.CREATE_ROLLUP);
    this.setState({ jsonString: DEFAULT_ROLLUP });
    await this.getIndices();
  }

  getIndices = async (): Promise<void> => {
    this.setState({ loadingIndices: true });
    try {
      const { rollupService } = this.props;
      console.log(this.props);
      // const queryParamsString = queryString.stringify(Indices.getQueryObjectFromState(this.state));
      // history.replace({ ...this.props.location, search: queryParamsString });
      const getIndicesResponse = await rollupService.getIndices();
      if (getIndicesResponse.ok) {
        const { indices, totalIndices } = getIndicesResponse.response;
        this.setState({ indices, totalIndices });
      } else {
        toastNotifications.addDanger(getIndicesResponse.error);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "There was a problem loading the indices"));
    }
    this.setState({ loadingIndices: false });
    console.log(this.state.indices);
  };

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

  onChangeJSON = (value: string): void => {
    this.setState({ jsonString: value });
  };

  onAutoIndent = (): void => {
    try {
      const parsedJSON = JSON.parse(this.state.jsonString);
      this.setState({ jsonString: JSON.stringify(parsedJSON, null, 4) });
    } catch (err) {
      // do nothing
    }
  };

  onNext = (): void => {
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
    const {
      rollupSeqNo,
      rollupPrimaryTerm,
      rollupId,
      rollupIdError,
      submitError,
      jsonString,
      isSubmitting,
      hasSubmitted,
      loadingIndices,
      indices,
      totalIndices,
    } = this.state;
    // Will be used later on for DefineRollup job (similar to DefinePolicy)
    let hasJSONError = false;
    try {
      JSON.parse(jsonString);
    } catch (err) {
      hasJSONError = true;
    }

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
            <ConfigureRollup rollupId={rollupId} rollupIdError={rollupIdError} onChange={this.onChange} />
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
