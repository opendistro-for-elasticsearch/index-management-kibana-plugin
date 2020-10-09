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
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiCallOut, EuiComboBoxOptionOption } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import ConfigureRollup from "../../components/ConfigureRollup";
import RollupIndices from "../../components/RollupIndices";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import Roles from "../../components/Roles";
import IndexService from "../../../../services/IndexService";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  indexService: IndexService;
  rollupId: string;
  rollupIdError: string;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  roles: EuiComboBoxOptionOption<String>[];
  onChangeRoles: (selectedOptions: EuiComboBoxOptionOption<String>[]) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  roleOptions: EuiComboBoxOptionOption<String>[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
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

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    chrome.breadcrumbs.push(BREADCRUMBS.CREATE_ROLLUP);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.props;
    const rollupId = e.target.value;
    if (hasSubmitted) this.setState({ rollupId, rollupIdError: rollupId ? "" : "Required" });
    else this.setState({ rollupId });
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    this.setState({ description });
  };

  onChangeRoles = (selectedOptions: EuiComboBoxOptionOption<String>[]): void => {
    this.setState({ roles: selectedOptions });
  };

  render() {
    if (this.props.currentStep !== 1) {
      // Prop: The current step
      return null;
    }
    const {
      rollupId,
      rollupIdError,
      submitError,
      isSubmitting,
      description,
      roles,
      onChangeRoles,
      roleOptions,
      onChangeDescription,
      onChange,
    } = this.props;

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
              rollupId={rollupId}
              rollupIdError={rollupIdError}
              description={description}
              onChange={onChange}
              onChangeDescription={onChangeDescription}
            />
            <EuiSpacer />
            <RollupIndices rollupId={rollupId} rollupIdError={rollupIdError} onChange={this.onChange} />
            <EuiSpacer />
            <Roles rollupId={rollupId} rollupIdError={rollupIdError} onChange={onChangeRoles} roles={roles} roleOptions={options} />
            {submitError && (
              <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
                <p>{submitError}</p>
              </EuiCallOut>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
