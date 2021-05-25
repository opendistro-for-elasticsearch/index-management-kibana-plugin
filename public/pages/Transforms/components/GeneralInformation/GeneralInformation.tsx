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

interface GeneralInformationProps {
  id: string;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  sourceIndexFilter: string;
  scheduledText: string;
  pageSize: number;
  enabledAt: number;
  updatedAt: number;
  onEdit: () => void;
}

export default class GeneralInformation extends Component<GeneralInformationProps> {
  constructor(props: GeneralInformationProps) {
    super(props);
  }

  render() {
    const { id, description, sourceIndex, targetIndex, sourceIndexFilter, scheduledText, pageSize, updatedAt, onEdit } = this.props;

    const enableDate = new Date(updatedAt);

    const infoItems = [
      { term: "Name", value: id },
      { term: "State", value: "Enabled on " + enableDate.toLocaleString() }, // show disabled state, make a const
      { term: "Source index", value: sourceIndex },
      { term: "Schedule", value: scheduledText },
      { term: "Description", value: description || "-" },
      {},
      { term: "Source index filter", value: sourceIndexFilter },
      { term: "Pages per execution", value: pageSize },
      {},
      {},
      { term: "Target index", value: targetIndex },
    ];

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
                      onClick: () => onEdit(),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title="General information"
        titleSize="m"
      >
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={4}>
            {infoItems.map((item, index) => (
              <EuiFlexItem key={index}>
                <EuiText size="xs">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
          <EuiSpacer size="s" />
        </div>
      </ContentPanel>
    );
  }
}
