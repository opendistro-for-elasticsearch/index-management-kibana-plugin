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
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";

interface AggregationAndMetricsSettingsProps {
  // rollupId: string;
  // description: string;
  // sourceIndex: string;
  // targetIndex: string;
  // roles: string[];
  // onEdit: () => void;
}

export default class AggregationAndMetricsSettings extends Component<AggregationAndMetricsSettingsProps> {
  constructor(props: AggregationAndMetricsSettingsProps) {
    super(props);
  }

  render() {
    // const { rollupId, description, onEdit, sourceIndex, targetIndex, roles } = this.props;

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Aggregation and metrics settings" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size={"s"} />

          <EuiSpacer size={"s"} />
        </div>
      </ContentPanel>
    );
  }
}
