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
import { EuiComboBoxOptionOption, EuiFlexGrid, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";

interface HistogramAndMetricsProps {
  rollupId: string;
  onChangeStep: (step: number) => void;
  timestamp: EuiComboBoxOptionOption<String>[];
  intervalValue: number;
  timezone: string;
  timeunit: string;
}

export default class HistogramAndMetrics extends Component<HistogramAndMetricsProps> {
  constructor(props: HistogramAndMetricsProps) {
    super(props);
  }

  render() {
    const { onChangeStep, intervalValue, timestamp, timezone, timeunit } = this.props;
    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {() => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Edit",
                    buttonProps: {
                      onClick: () => onChangeStep(2),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title="Aggregation and metrics setting"
        titleSize="m"
      >
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size={"s"} />
          <EuiText>
            <h3>Time aggregation</h3>
          </EuiText>
          <EuiSpacer size={"s"} />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Timestamp field</dt>
                <dd>{timestamp[0].label}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Interval</dt>
                <dd>{`${intervalValue} ${timeunit}`}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Timezone</dt>
                <dd>{timezone}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size={"m"} />

          <EuiText>
            <h3>Additional aggregations</h3>
          </EuiText>

          <EuiSpacer size={"m"} />

          <EuiText>
            <h3>Additional metrics</h3>
          </EuiText>

          <EuiSpacer size={"s"} />
        </div>
      </ContentPanel>
    );
  }
}
