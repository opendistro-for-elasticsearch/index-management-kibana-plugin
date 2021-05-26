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

import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiCallOut } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { TransformService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { FieldItem, IndexItem, TransformAggItem, TransformGroupItem } from "../../../../../models/interfaces";
import CreateTransformSteps from "../../components/CreateTransformSteps";
import JobNameAndIndices from "../../components/JobNameAndIndices";
import ReviewDefinition from "../../components/ReviewDefinition";
import ReviewSchedule from "../../components/ReviewSchedule";
import { CoreServicesContext } from "../../../../components/core_services";

interface CreateTransformProps extends RouteComponentProps {
  transformService: TransformService;
  submitError: string;
  currentStep: number;
  onChangeStep: (step: number) => void;
  transformId: string;
  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  targetIndex: { label: string; value?: IndexItem }[];
  sourceIndexFilter: string;

  jobEnabledByDefault: boolean;
  pageSize: number;
  fields: FieldItem[];
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  selectedAggregations: any;
  aggList: TransformAggItem[];
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
  onRemoveTransformation: (name: string) => void;
  previewTransform: any[];

  interval: number;
  intervalTimeunit: string;
}

export default class CreateTransformStep4 extends Component<CreateTransformProps> {
  static contextType = CoreServicesContext;
  constructor(props: CreateTransformProps) {
    super(props);
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.TRANSFORMS);
  };

  render() {
    if (this.props.currentStep != 4) return null;

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateTransformSteps step={4} />
          </EuiFlexItem>
          <EuiFlexItem style={{ maxWidth: "80%" }} grow={false}>
            <EuiTitle size="l">
              <h1>Review and create</h1>
            </EuiTitle>
            <EuiSpacer />
            <JobNameAndIndices {...this.props} />
            <EuiSpacer />
            <ReviewDefinition {...this.props} notifications={this.context.notifications} sourceIndex={this.props.sourceIndex[0].label} />
            <EuiSpacer />
            <ReviewSchedule {...this.props} />
            <EuiSpacer />
            <EuiCallOut color="warning">
              <p>You can only change the description and schedule after creating a job. Double-check your choices before proceeding.</p>
            </EuiCallOut>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
