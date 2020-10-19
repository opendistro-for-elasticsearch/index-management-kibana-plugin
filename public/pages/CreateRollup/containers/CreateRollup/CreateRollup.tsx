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
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiComboBoxOptionOption } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import ConfigureRollup from "../../components/ConfigureRollup";
import RollupIndices from "../../components/RollupIndices";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import Roles from "../../components/Roles";
import IndexService from "../../../../services/IndexService";
import { IndexItem } from "../../../../../models/interfaces";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  indexService: IndexService;
  rollupId: string;
  rollupIdError: string;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;
  roles: EuiComboBoxOptionOption<String>[];
  onChangeName: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  roleOptions: EuiComboBoxOptionOption<String>[];
  onChangeSourceIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  onChangeTargetIndex: (options: EuiComboBoxOptionOption<IndexItem>[]) => void;
  onChangeRoles: (selectedOptions: EuiComboBoxOptionOption<String>[]) => void;
  currentStep: number;
}

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

export default class CreateRollup extends Component<CreateRollupProps> {
  constructor(props: CreateRollupProps) {
    super(props);
  }

  render() {
    if (this.props.currentStep !== 1) {
      // Prop: The current step
      return null;
    }
    const { rollupId, rollupIdError, description, roles, onChangeName, onChangeDescription, onChangeRoles } = this.props;

    return (
      <div style={{ padding: "5px 50px" }}>
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
              isEdit={false}
              rollupId={rollupId}
              rollupIdError={rollupIdError}
              description={description}
              onChangeName={onChangeName}
              onChangeDescription={onChangeDescription}
            />
            <EuiSpacer />
            <RollupIndices {...this.props} />
            <EuiSpacer />
            <Roles rollupId={rollupId} rollupIdError={rollupIdError} onChange={onChangeRoles} roles={roles} roleOptions={options} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
