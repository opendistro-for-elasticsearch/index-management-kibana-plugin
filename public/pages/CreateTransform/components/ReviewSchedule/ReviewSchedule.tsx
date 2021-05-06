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
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";

interface ReviewScheduleProps {
  jobEnabledByDefault: boolean;
  interval: number;
  intervalTimeunit: string;
  pageSize: number;
  onChangeStep: (step: number) => void;
}

export default class ReviewSchedule extends Component<ReviewScheduleProps> {
  constructor(props: ReviewScheduleProps) {
    super(props);
  }

  render() {
    const { jobEnabledByDefault,
            interval,
            intervalTimeunit,
            pageSize,
            onChangeStep,
     } = this.props;

    const enabled = (jobEnabledByDefault) ? ("Yes") : ("No");

    const schedule = "Every " + interval + " " + intervalTimeunit.toLowerCase();

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
                      onClick: () => onChangeStep(3)
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title="Specify schedule"
        titleSize="m"
      >
        <div style={{ padding: "15px" }}>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Enabled by default</dt>
                <dd>{enabled}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Schedule</dt>
                <dd>{schedule}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Pages per execution</dt>
                <dd>{pageSize}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
        </div>
      </ContentPanel>
    )
  }
}
