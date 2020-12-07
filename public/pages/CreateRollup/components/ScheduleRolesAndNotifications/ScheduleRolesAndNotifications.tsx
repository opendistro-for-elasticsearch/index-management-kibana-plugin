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
import { EuiFlexGrid, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { parseTimeunit } from "../../utils/helpers";

interface ScheduleRolesAndNotificationsProps {
  rollupId: string;
  onChangeStep: (step: number) => void;
  jobEnabledByDefault: boolean;
  continuousJob: string;
  continuousDefinition: string;
  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  cronTimezone: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
}

export default class ScheduleRolesAndNotifications extends Component<ScheduleRolesAndNotificationsProps> {
  render() {
    const {
      onChangeStep,
      jobEnabledByDefault,
      continuousJob,
      continuousDefinition,
      interval,
      intervalTimeunit,
      cronExpression,
      pageSize,
      delayTime,
      delayTimeunit,
    } = this.props;

    let scheduleText = continuousJob ? "Continuous, " : "Not continuous, ";
    if (continuousDefinition == "fixed") {
      scheduleText += "every " + interval + " " + parseTimeunit(intervalTimeunit);
    } else {
      scheduleText += "defined by cron expression: " + cronExpression;
    }

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
        <div style={{ padding: "15px" }}>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Enabled by default</dt>
                <dd>{jobEnabledByDefault ? "Yes" : "No"}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Schedule</dt>
                <dd>{scheduleText}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Pages per execution</dt>
                <dd>{pageSize}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Execution delay</dt>
                <dd>
                  {isNaN(delayTime) || delayTime == undefined || delayTime == 0 ? "-" : delayTime + " " + parseTimeunit(delayTimeunit)}
                </dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="s" />
        </div>
      </ContentPanel>
    );
  }
}
