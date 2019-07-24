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

import React, { ChangeEvent, Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty } from "@elastic/eui";
import chrome from "ui/chrome";
import { toastNotifications } from "ui/notify";
import "brace/theme/github";
import "brace/mode/json";
// @ts-ignore
import queryString from "query-string";
import { RouteComponentProps } from "react-router";
import { IHttpResponse, IHttpService } from "angular";
import { DEFAULT_POLICY } from "../../utils/constants";
import DefinePolicy from "../../components/DefinePolicy";
import ConfigurePolicy from "../../components/ConfigurePolicy";
import { DocumentPolicy, Policy } from "../../../../../models/interfaces";
import { ServerResponse } from "../../../../../server/models/types";
import { PutPolicyResponse } from "../../../../../server/models/interfaces";

interface CreatePolicyProps extends RouteComponentProps {
  isEdit: boolean;
  httpClient: IHttpService;
}

interface CreatePolicyState {
  policyId: string;
  policyIdError: string;
  jsonString: string;
  policySeqNo: number | null;
  policyPrimaryTerm: number | null;
}

class CreatePolicy extends Component<CreatePolicyProps, CreatePolicyState> {
  constructor(props: CreatePolicyProps) {
    super(props);

    this.state = {
      policySeqNo: null,
      policyPrimaryTerm: null,
      policyId: "",
      policyIdError: "",
      jsonString: "",
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([
      { text: "Index Management", href: "#/" },
      {
        text: "Policies",
        href: "#/policies",
      },
    ]);
    if (this.props.isEdit) {
      const { id } = queryString.parse(this.props.location.search);
      if (typeof id === "string") {
        chrome.breadcrumbs.push({ text: "Edit policy" });
        chrome.breadcrumbs.push({ text: id });
        await this.getPolicyToEdit(id);
      } else {
        toastNotifications.addDanger(`Invalid policyId: ${id}`);
        this.props.history.push(`/policies`);
      }
    } else {
      chrome.breadcrumbs.push({ text: "Create policy" });
      this.setState({ jsonString: DEFAULT_POLICY });
    }
  };

  onCancel = (): void => {
    if (this.props.isEdit) this.props.history.goBack();
    else this.props.history.push("/policies");
  };

  getPolicyToEdit = async (policyId: string): Promise<void> => {
    try {
      const { httpClient } = this.props;
      const response = (await httpClient.get(`../api/ism/policies/${policyId}`)) as IHttpResponse<ServerResponse<DocumentPolicy>>;
      if (response.data.ok) {
        this.setState({
          policySeqNo: response.data.response.seqNo,
          policyPrimaryTerm: response.data.response.primaryTerm,
          policyId: response.data.response.id,
          jsonString: JSON.stringify({ policy: response.data.response.policy }, null, 4),
        });
      } else {
        toastNotifications.addDanger(`Could not load the policy: ${response.data.error}`);
        this.props.history.push(`/policies`);
      }
    } catch (err) {
      toastNotifications.addDanger("Could not load the policy");
      this.props.history.push(`/policies`);
    }
  };

  onCreate = async (policyId: string, policy: Policy): Promise<void> => {
    const { httpClient } = this.props;
    try {
      const response = (await httpClient.put(`../api/ism/policies/${policyId}`, policy)) as IHttpResponse<
        ServerResponse<PutPolicyResponse>
      >;
      if (response.data.ok) {
        toastNotifications.addSuccess(`Created policy: ${response.data.response._id}`);
        this.props.history.push(`/policies`);
      } else {
        toastNotifications.addDanger(`Failed to create policy: ${response.data.error}`);
      }
    } catch (err) {
      toastNotifications.addDanger(err.message || err.data.message || "There was a problem updating the policy");
    }
  };

  onUpdate = async (policyId: string, policy: Policy): Promise<void> => {
    try {
      const { httpClient } = this.props;
      const { policyPrimaryTerm, policySeqNo } = this.state;
      if (policySeqNo == null || policyPrimaryTerm == null) {
        toastNotifications.addDanger("Could not update policy without seqNo and primaryTerm");
        return;
      }
      const response = (await httpClient.put(
        `../api/ism/policies/${policyId}?ifSeqNo=${policySeqNo}&ifPrimaryTerm=${policyPrimaryTerm}`,
        policy
      )) as IHttpResponse<ServerResponse<PutPolicyResponse>>;
      if (response.data.ok) {
        toastNotifications.addSuccess(`Updated policy: ${response.data.response._id}`);
        this.props.history.push(`/policies`);
      } else {
        toastNotifications.addDanger(`Failed to update policy: ${response.data.error}`);
      }
    } catch (err) {
      toastNotifications.addDanger(err.message || err.data.message || "There was a problem updating the policy");
    }
  };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ policyId: e.target.value });
  };

  onBlur = (): void => {
    const { policyId } = this.state;
    this.setState({ policyIdError: policyId ? "" : "Required" });
  };

  onFocus = (): void => {
    this.setState({ policyIdError: "" });
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
    if (!policyId) return;
    try {
      const policy = JSON.parse(jsonString);
      if (isEdit) await this.onUpdate(policyId, policy);
      else await this.onCreate(policyId, policy);
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { isEdit } = this.props;
    const { policyId, policyIdError, jsonString } = this.state;

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
        <ConfigurePolicy
          policyId={policyId}
          policyIdError={policyIdError}
          isEdit={isEdit}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
        />
        <EuiSpacer />
        <DefinePolicy jsonString={jsonString} onChange={this.onChangeJSON} onAutoIndent={this.onAutoIndent} hasJSONError={hasJSONError} />
        <EuiSpacer />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={false} disabled={hasJSONError || !policyId}>
              {isEdit ? "Update" : "Create"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}

export default CreatePolicy;
