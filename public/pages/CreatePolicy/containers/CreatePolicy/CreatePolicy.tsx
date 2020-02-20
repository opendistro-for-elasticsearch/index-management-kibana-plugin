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
import { toastNotifications } from "ui/notify";
import queryString from "query-string";
import { RouteComponentProps } from "react-router";
import { DEFAULT_POLICY } from "../../utils/constants";
import DefinePolicy from "../../components/DefinePolicy";
import ConfigurePolicy from "../../components/ConfigurePolicy";
import { Policy } from "../../../../../models/interfaces";
import { PolicyService } from "../../../../services";
import { BREADCRUMBS, DOCUMENTATION_URL, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";

interface CreatePolicyProps extends RouteComponentProps {
  isEdit: boolean;
  policyService: PolicyService;
}

interface CreatePolicyState {
  policyId: string;
  policyIdError: string;
  jsonString: string;
  policySeqNo: number | null;
  policyPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

export default class CreatePolicy extends Component<CreatePolicyProps, CreatePolicyState> {
  _isMounted: boolean = false;

  constructor(props: CreatePolicyProps) {
    super(props);

    this.state = {
      policySeqNo: null,
      policyPrimaryTerm: null,
      policyId: "",
      policyIdError: "",
      submitError: "",
      jsonString: "",
      isSubmitting: false,
      hasSubmitted: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    this._isMounted = true;
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES]);
    if (this.props.isEdit) {
      const { id } = queryString.parse(this.props.location.search);
      if (typeof id === "string" && !!id) {
        chrome.breadcrumbs.push(BREADCRUMBS.EDIT_POLICY);
        chrome.breadcrumbs.push({ text: id });
        await this.getPolicyToEdit(id);
      } else {
        toastNotifications.addDanger(`Invalid policy id: ${id}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      }
    } else {
      chrome.breadcrumbs.push(BREADCRUMBS.CREATE_POLICY);
      this.setState({ jsonString: DEFAULT_POLICY });
    }
  };

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  getPolicyToEdit = async (policyId: string): Promise<void> => {
    try {
      const { policyService } = this.props;
      const response = await policyService.getPolicy(policyId);
      if (response.ok) {
        this.setState({
          policySeqNo: response.response.seqNo,
          policyPrimaryTerm: response.response.primaryTerm,
          policyId: response.response.id,
          jsonString: JSON.stringify({ policy: response.response.policy }, null, 4),
        });
      } else {
        toastNotifications.addDanger(`Could not load the policy: ${response.error}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not load the policy"));
      this.props.history.push(ROUTES.INDEX_POLICIES);
    }
  };

  onCreate = async (policyId: string, policy: Policy): Promise<void> => {
    const { policyService } = this.props;
    try {
      const response = await policyService.putPolicy(policy, policyId);
      if (response.ok) {
        toastNotifications.addSuccess(`Created policy: ${response.response._id}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      } else {
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem creating the policy") });
    }
  };

  onUpdate = async (policyId: string, policy: Policy): Promise<void> => {
    try {
      const { policyService } = this.props;
      const { policyPrimaryTerm, policySeqNo } = this.state;
      if (policySeqNo == null || policyPrimaryTerm == null) {
        toastNotifications.addDanger("Could not update policy without seqNo and primaryTerm");
        return;
      }
      const response = await policyService.putPolicy(policy, policyId, policySeqNo, policyPrimaryTerm);
      if (response.ok) {
        toastNotifications.addSuccess(`Updated policy: ${response.response._id}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      } else {
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem updating the policy") });
    }
  };

  onCancel = (): void => {
    if (this.props.isEdit) this.props.history.goBack();
    else this.props.history.push(ROUTES.INDEX_POLICIES);
  };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const policyId = e.target.value;
    if (hasSubmitted) this.setState({ policyId, policyIdError: policyId ? "" : "Required" });
    else this.setState({ policyId });
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
    const { policyId, jsonString } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!policyId) {
        this.setState({ policyIdError: "Required" });
      } else {
        const policy = JSON.parse(jsonString);
        if (isEdit) await this.onUpdate(policyId, policy);
        else await this.onCreate(policyId, policy);
      }
    } catch (err) {
      toastNotifications.addDanger("Invalid Policy JSON");
      console.error(err);
    }

    if (this._isMounted) this.setState({ isSubmitting: false });
  };

  renderEditCallOut = (): React.ReactNode | null => {
    const { isEdit } = this.props;
    if (!isEdit) return null;

    return (
      <Fragment>
        <EuiCallOut
          title="Edits to the policy are not automatically applied to indices that are already being managed by this policy."
          iconType="questionInCircle"
        >
          <p>
            This ensures that any update to a policy doesn't harm indices that are running under an older version of the policy. To carry
            over your edits to these indices, please use the "Change Policy" under "Managed Indices" to reapply the policy after submitting
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
    const { policyId, policyIdError, jsonString, submitError, isSubmitting } = this.state;

    let hasJSONError = false;
    try {
      JSON.parse(jsonString);
    } catch (err) {
      hasJSONError = true;
    }

    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} policy</h1>
        </EuiTitle>
        <EuiSpacer />
        {this.renderEditCallOut()}
        <ConfigurePolicy policyId={policyId} policyIdError={policyIdError} isEdit={isEdit} onChange={this.onChange} />
        <EuiSpacer />
        <DefinePolicy jsonString={jsonString} onChange={this.onChangeJSON} onAutoIndent={this.onAutoIndent} hasJSONError={hasJSONError} />
        <EuiSpacer />
        {submitError && (
          <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
            <p>{submitError}</p>
          </EuiCallOut>
        )}
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
