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
import { EuiSpacer, EuiText, EuiAccordion } from "@elastic/eui";
// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { ContentPanel } from "../../../../components/ContentPanel";
import { TransformService } from "../../../../services";

interface TransformSettingsProps {
  transformService: TransformService;
  transformJson: Map<string, any>;
}

interface TransformSettingsState {}

export default class TransformSettings extends Component<TransformSettingsProps, TransformSettingsState> {
  constructor(props: TransformSettingsProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Transform settings" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiText>
            <h3>Groups</h3>
          </EuiText>
        </div>
        <EuiAccordion id={htmlIdGenerator()()} buttonContent={"Sample source index and transform result"} onClick={this.onClick}>
          <div>
            // TODO: Use the source data preview table from create workflow // TODO: Use the transformed preview table from create workflow
          </div>
        </EuiAccordion>
      </ContentPanel>
    );
  }

  onClick = async () => {
    const response = await this.props.transformService.previewTransform(this.props.transformJson);
    console.log(response);
    console.log("tada");
  };
}
