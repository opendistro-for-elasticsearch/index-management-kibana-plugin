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
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiAccordion } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { TransformGroupItem } from "../../../../../models/interfaces";
import DefineTransforms from "../DefineTransforms";

interface ReviewDefinitionProps {
  selectedGroupField: TransformGroupItem[];
  selectedAggregations: any;
  onChangeStep: (step: number) => void;
}

export default class ReviewDefinition extends Component<ReviewDefinitionProps> {
  constructor(props: ReviewDefinitionProps) {
    super(props);
  }

  render() {
    const { selectedGroupField, selectedAggregations, onChangeStep } = this.props;

    const groupItems = () => {
      return selectedGroupField.map((group) => {
        return (
          <EuiFlexItem>
            <EuiText size="xs">
              <dt>Group</dt>
              <dd>{JSON.stringify(group)}</dd>
            </EuiText>
          </EuiFlexItem>
        );
      });
    };

    const aggItems = () => {
      return Object.keys(selectedAggregations).map((key) => {
        return (
          <EuiFlexItem>
            <EuiText size="xs">
              <dt>{key}</dt>
              <dd>{JSON.stringify(selectedAggregations[key])}</dd>
            </EuiText>
          </EuiFlexItem>
        );
      });
    };

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
        title="Define transforms"
        titleSize="m"
      >
        <div style={{ padding: "15px" }}>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={1}>
            {groupItems()}
            {aggItems()}
          </EuiFlexGrid>
          <EuiSpacer />
          <EuiAccordion id="" buttonContent="Sample source index and transform result"></EuiAccordion>
        </div>
      </ContentPanel>
    );
  }
}
