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
import { TransformGroupItem, DimensionItem, FieldItem, TransformAggItem } from "../../../../../models/interfaces";
import DefineTransforms from "../DefineTransforms";
import { TransformService } from "../../../../services";
import { CoreStart } from "kibana/public";

interface ReviewDefinitionProps {
  transformService: TransformService;
  notifications: CoreStart["notifications"];
  transformId: string;
  sourceIndex: string;
  fields: FieldItem[];
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  selectedAggregations: any;
  aggList: TransformAggItem[];
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
  onRemoveTransformation: (name: string) => void;
  previewTransform: any[];
  onChangeStep: (step: number) => void;
}

export default class ReviewDefinition extends Component<ReviewDefinitionProps> {
  constructor(props: ReviewDefinitionProps) {
    super(props);
  }

  render() {
    const {
      transformService,
      sourceIndex,
      fields,
      selectedGroupField,
      onGroupSelectionChange,
      selectedAggregations,
      onAggregationSelectionChange,
      onRemoveTransformation,
      onChangeStep,
    } = this.props;

    const groupItems = () => {
      return selectedGroupField.map((group) => {
        let parsedGroup = parseGroup(group);
        return (
          <EuiFlexItem>
            <EuiText size="xs">
              <dt>Group by {parsedGroup.aggregationMethod}</dt>
              <dd>{parsedGroup.field.label}</dd>
            </EuiText>
          </EuiFlexItem>
        );
      });
    };

    const parseGroup = (group: TransformGroupItem): DimensionItem => {
      switch (true) {
        case group.date_histogram != null:
          return {
            sequence: 0,
            aggregationMethod: "date_histogram",
            field: {
              label: group.date_histogram?.source_field,
            },
            interval: group.date_histogram?.interval,
          };
        case group.histogram != null:
          return {
            sequence: 0,
            aggregationMethod: "histogram",
            field: {
              label: group.histogram?.source_field,
            },
            interval: group.histogram?.interval,
          };
        case group.terms != null:
          return {
            sequence: 0,
            aggregationMethod: "terms",
            field: {
              label: group.terms?.source_field,
            },
            interval: null,
          };
      }
    };

    const aggItems = () => {
      return Object.keys(selectedAggregations).map((key) => {
        let aggregationType = Object.keys(selectedAggregations[key])[0];
        let sourceField = selectedAggregations[key][aggregationType].field;

        return (
          <EuiFlexItem>
            <EuiText size="xs">
              <dt>{aggregationType}()</dt>
              <dd>{sourceField}</dd>
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
        panelStyles={{ padding: "20px 20px" }}
        bodyStyles={{ padding: "10px" }}
        title="Define transforms"
        titleSize="m"
      >
        <div style={{ padding: "10px" }}>
          <EuiFlexGrid columns={4}>
            {groupItems()}
            {aggItems()}
          </EuiFlexGrid>
          <EuiSpacer />
          <EuiAccordion id="" buttonContent="Sample source index and transform result">
            <div style={{ padding: "10px" }}>
              <EuiSpacer size="m" />
              <DefineTransforms
                {...this.props}
                transformService={transformService}
                notifications={this.context.notifications}
                sourceIndex={sourceIndex}
                fields={fields}
                onGroupSelectionChange={onGroupSelectionChange}
                selectedAggregations={selectedAggregations}
                onAggregationSelectionChange={onAggregationSelectionChange}
                onRemoveTransformation={onRemoveTransformation}
                isReadOnly={true}
              />
            </div>
          </EuiAccordion>
        </div>
      </ContentPanel>
    );
  }
}
