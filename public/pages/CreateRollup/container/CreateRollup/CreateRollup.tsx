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
import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiLink,
  EuiIcon,
  EuiSteps,
  EuiText,
  EuiCode,
} from "@elastic/eui";
import chrome from "ui/chrome";
import { toastNotifications } from "ui/notify";
import queryString from "query-string";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, DOCUMENTATION_URL, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { DEFAULT_POLICY } from "../../../CreatePolicy/utils/constants";
import ConfigureRollup from "../../component/ConfigureRollup";
import { Rollup } from "../../../../../models/interfaces";
import RollupIndices from "../../component/RollupIndices";
import CreateRollupSteps from "../../component/CreateRollupSteps";

interface CreateRollupProps extends RouteComponentProps {
  isEdit: boolean;
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
    };
  }

  //TODO: Figure out what to do with the DEFAULT_POLICY part.

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    if (this.props.isEdit) {
      const { id } = queryString.parse(this.props.location.search);
      if (typeof id === "string" && !!id) {
        chrome.breadcrumbs.push(BREADCRUMBS.EDIT_ROLLUP);
        chrome.breadcrumbs.push({ text: id });
        await this.getRollupToEdit(id);
      } else {
        toastNotifications.addDanger(`Invalid rollup id: ${id}`);
        this.props.history.push(ROUTES.ROLLUPS);
      }
    } else {
      chrome.breadcrumbs.push(BREADCRUMBS.CREATE_ROLLUP);
      this.setState({ jsonString: DEFAULT_POLICY });
    }
  };

  getRollupToEdit = async (rollupId: string): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const response = await rollupService.getRollup(rollupId);
      if (response.ok) {
        //TODO: Figure out what DocumentResponse does, so that the JSON.stringify can do appropriate action to rollup
        this.setState({
          rollupSeqNo: response.response.seqNo,
          rollupPrimaryTerm: response.response.primaryTerm,
          rollupId: response.response.id,
          jsonString: JSON.stringify({ rollup: response.response.rollup }, null, 4),
        });
      } else {
        toastNotifications.addDanger(`Could not load the rollup: ${response.error}`);
        this.props.history.push(ROUTES.ROLLUPS);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not load the rollup"));
      this.props.history.push(ROUTES.ROLLUPS);
    }
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

  //TODO: Go back to rollup jobs page when cancelled
  onCancel = (): void => {
    if (this.props.isEdit) this.props.history.goBack();
    else this.props.history.push(ROUTES.ROLLUPS);
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

  onSubmit = async (): Promise<void> => {
    const { isEdit } = this.props;
    const { rollupId, jsonString } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!rollupId) {
        this.setState({ rollupIdError: "Required" });
      } else {
        const rollup = JSON.parse(jsonString);
        if (isEdit) await this.onUpdate(rollupId, rollup);
        else await this.onCreate(rollupId, rollup);
      }
    } catch (err) {
      toastNotifications.addDanger("Invalid Rollup JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  renderEditCallOut = (): React.ReactNode | null => {
    const { isEdit } = this.props;
    if (!isEdit) return null;

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
    const { isEdit } = this.props;
    const { rollupId, rollupIdError, jsonString, submitError, isSubmitting } = this.state;
    // Will be used later on for DefineRollup job (similar to DefinePolicy)
    let hasJSONError = false;
    try {
      JSON.parse(jsonString);
    } catch (err) {
      hasJSONError = true;
    }

    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} rollup job profile</h1>
        </EuiTitle>
        <EuiSpacer />
        {this.renderEditCallOut()}
        <EuiFlexGroup>
          <EuiFlexItem>
            <CreateRollupSteps rollupId={rollupId} rollupIdError={rollupIdError} isEdit={isEdit} onChange={this.onChange} />
          </EuiFlexItem>
          <EuiFlexItem>
            <ConfigureRollup rollupId={rollupId} rollupIdError={rollupIdError} isEdit={isEdit} onChange={this.onChange} />
            <EuiSpacer />
            <RollupIndices rollupId={rollupId} rollupIdError={rollupIdError} isEdit={isEdit} onChange={this.onChange} />
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
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createPolicyCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="createPolicyCreateButton">
              {isEdit ? "Update" : "Create"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
