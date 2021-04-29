/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { RouteComponentProps } from "react-router-dom";
import { TransformService } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import React, { Component } from "react";
import { EMPTY_TRANSFORM } from "../../utils/constants";
import queryString from "query-string";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { EuiFlexItem, EuiFlexGroup, EuiButton, EuiTitle, EuiSpacer, EuiButtonEmpty } from "@elastic/eui";
import ConfigureTransform from "../../components/ConfigureTransform";

interface EditTransformProps extends RouteComponentProps {
  transformService: TransformService;
}

interface EditTransformState {
  id: string;
  error: string;
  seqNo: number | null;
  primaryTerm: number | null;
  description: string;
  pageSize: number;
  enabled: boolean;
  transformJSON: any;
  isLoading: boolean;
}

export default class EditTransform extends Component<EditTransformProps, EditTransformState> {
  static contextType = CoreServicesContext;

  constructor(props: EditTransformProps) {
    super(props);
    this.state = {
      id: "",
      error: "",
      seqNo: null,
      primaryTerm: null,
      description: "",
      pageSize: 1000,
      enabled: true,
      transformJSON: EMPTY_TRANSFORM,
      isLoading: false,
    };
  }

  componentDidMount = async () => {
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string" && !!id) {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS, BREADCRUMBS.EDIT_TRANSFORM, { text: id }]);
      await this.getTransform(id);
    } else {
      this.context.notifications.toasts.addDanger(`Invalid transform id: ${id}`);
      this.props.history.push(ROUTES.TRANSFORMS);
    }
  };

  getTransform = async (transformId: string) => {
    try {
      const { transformService } = this.props;
      const response = await transformService.getTransform(transformId);

      if (response.ok) {
        let json = JSON.parse(this.state.transformJSON);
        json.transform = response.response.transform;

        this.setState({
          seqNo: response.response._seqNo,
          primaryTerm: response.response._primaryTerm,
          id: response.response._id,
          description: response.response.transform.description,
          enabled: response.response.transform.enabled,
          pageSize: response.response.transform.page_size,
          transformJSON: json,
        });
      } else {
        this.context.notifications.toasts.addDanger(`Could not load transform job ${transformId}: ${response.error}`);
        this.props.history.push(ROUTES.TRANSFORMS);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, `Could not load transform job ${transformId}`));
      this.props.history.push(ROUTES.TRANSFORMS);
    }
  };

  render() {
    const { id, error, description, isLoading } = this.state;
    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>Edit transform job</h1>
        </EuiTitle>
        <EuiSpacer />
        <ConfigureTransform
          inEdit={true}
          id={id}
          error={error}
          onChangeName={this.onChangeName}
          onChangeDescription={this.onChangeDescription}
          description={description}
        />
        <EuiSpacer />

        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="editTransformCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isLoading} data-test-subj="editTransformSaveButton">
              Save changes
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  onCancel = () => {};
  onSubmit = () => {};
  onChangeName = () => {};
  onChangeDescription = () => {};
}
