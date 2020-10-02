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
import { EuiSpacer, EuiFormRow, EuiComboBox, EuiComboBoxOptionOption } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface RolesProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface RolesStates {
  roles: EuiComboBoxOptionOption<String>[];
}

//TODO: Fetch roles from backend to fill in options
const options = [
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
export default class Roles extends Component<RolesProps, RolesStates> {
  constructor(props: RolesProps) {
    super(props);

    this.state = {
      roles: [{ label: "Role1" }],
    };
  }

  onChange = (selectedOptions: EuiComboBoxOptionOption<String>[]): void => {
    this.setState({ roles: selectedOptions });
  };

  render() {
    const { roles } = this.state;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Roles" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFormRow label="Roles" helpText="Security roles have access to this rollup job.">
            <EuiComboBox
              placeholder="Select for roles"
              options={options}
              selectedOptions={roles}
              onChange={this.onChange}
              isClearable={true}
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
