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
import { ContentPanel } from "../../../../components/ContentPanel";
import { DimensionItem } from "../../../CreateRollup/models/interfaces";
import { parseTimeunit, parseTimezone } from "../../../CreateRollup/utils/helpers";

interface AggregationAndMetricsSettingsProps {
  timestamp: string;
  histogramInterval: string;
  timezone: string;
  // selectedDimensionField: DimensionItem[];
}

export default class AggregationAndMetricsSettings extends Component<AggregationAndMetricsSettingsProps> {
  constructor(props: AggregationAndMetricsSettingsProps) {
    super(props);
  }

  render() {
    const { timestamp, histogramInterval, timezone } = this.props;

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Aggregation and metrics settings" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size={"s"} />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Timestamp field</dt>
                <dd>{timestamp}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Interval</dt>
                <dd>{histogramInterval}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Timezone</dt>
                <dd>{parseTimezone(timezone)}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size={"s"} />
        </div>
      </ContentPanel>
    );
  }
}
