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
import { EuiComboBox, EuiForm, EuiFlexGrid, EuiFlexItem } from "@elastic/eui";
import { EuiComboBoxOptionOption } from "@elastic/eui/src/components/combo_box/types";
import _ from "lodash";
import { CoreServicesContext } from "../../../../components/core_services";

interface IndexFilterPopoverProps {}

interface IndexFilterPopoverState {
  fieldSelectedOptions: [];
}

export default class IndexFilterPopover extends Component<IndexFilterPopoverProps, IndexFilterPopoverState> {
  static contextType = CoreServicesContext;

  constructor(props: IndexFilterPopoverProps) {
    super(props);
    this.state = {
      fieldSelectedOptions: [],
    };
  }

  async componentDidMount(): Promise<void> {}

  onFieldChange = (options) => {};

  render() {
    const { fieldSelectedOptions } = this.state;

    return (
      <EuiForm>
        <EuiFlexGrid columns={3}>
          <EuiFlexItem>
            Fields
            <EuiComboBox
              id="selectField"
              placeholder="Select Field"
              options={[]} // Needs options from source index
              selectedOptions={fieldSelectedOptions}
              onChange={this.onFieldChange}
              singleSelection={{ asPlainText: true }}
            />
          </EuiFlexItem>
          <EuiFlexItem>Operator</EuiFlexItem>
          <EuiFlexItem>Value</EuiFlexItem>
        </EuiFlexGrid>
      </EuiForm>
    );
  }
}
