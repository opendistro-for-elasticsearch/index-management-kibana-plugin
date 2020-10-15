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

import React, { Component } from "react";
import { EuiSpacer, EuiFormRow, EuiComboBox, EuiComboBoxOptionOption } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface RolesProps {
  rollupId: string;
  rollupIdError: string;
  onChange: (selectedOptions: EuiComboBoxOptionOption<String>[]) => void;
  roles: EuiComboBoxOptionOption<String>[];
  roleOptions: EuiComboBoxOptionOption<String>[];
}

export default class Roles extends Component<RolesProps> {
  constructor(props: RolesProps) {
    super(props);
  }

  render() {
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Roles" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFormRow label="Roles" helpText="These roles have access to this rollup job.">
            <EuiComboBox
              placeholder="Select for roles"
              options={this.props.roleOptions}
              selectedOptions={this.props.roles}
              onChange={this.props.onChange}
              isClearable={true}
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
