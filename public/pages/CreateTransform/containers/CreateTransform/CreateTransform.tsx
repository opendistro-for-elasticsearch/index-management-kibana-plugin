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

import React, { ChangeEvent, Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiComboBoxOptionOption } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { TransformService } from "../../../../services";
import ConfigureTransform from "../../components/ConfigureTransform";
import TransformIndices from "../../components/TransformIndices";
import CreateTransformSteps from "../../components/CreateTransformSteps";
import IndexService from "../../../../services/IndexService";
import { FieldItem, IndexItem } from "../../../../../models/interfaces";

interface CreateTransformProps extends RouteComponentProps {
  transformService: TransformService;
  indexService: IndexService;
  transformId: string;
  transformIdError: string;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;
  onChangeName: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeSourceIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  onChangeTargetIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  currentStep: number;
  hasAggregation: boolean;
  fields: FieldItem[];
  fieldSelectedOption: string;
  onFieldChange: () => void;
}

export default class CreateTransform extends Component<CreateTransformProps> {
  render() {
    if (this.props.currentStep !== 1) {
      return null;
    }

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateTransformSteps step={1} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Set up indices</h1>
            </EuiTitle>
            <EuiSpacer />
            <ConfigureTransform isEdit={false} {...this.props} />
            <EuiSpacer />
            <TransformIndices {...this.props} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
