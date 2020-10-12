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

import React, { Component } from "react";
import { EuiFlexGrid, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";

interface ScheduleRolesAndNotificationsProps {
  rollupId: string;
  rollupIdError: string;
  onChangeStep: (step: number) => void;
}

export default class ScheduleRolesAndNotifications extends Component<ScheduleRolesAndNotificationsProps> {
  constructor(props: ScheduleRolesAndNotificationsProps) {
    super(props);
  }
  render() {
    const { onChangeStep } = this.props;
    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {({ onShow }) => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Edit",
                    buttonProps: {
                      onClick: () => onChangeStep(3),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title="Schedule"
        titleSize="m"
      >
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size={"s"} />
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Enabled by default</dt>
                <dd>{}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Schedule</dt>
                <dd>{}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Pages per execution</dt>
                <dd>{}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Execution delay</dt>
                <dd>{}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size={"s"} />
        </div>
      </ContentPanel>
    );
  }
}
