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
import { EuiSpacer, EuiText, EuiAccordion, EuiFlexGrid, EuiFlexItem } from "@elastic/eui";
// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { ContentPanel } from "../../../../components/ContentPanel";
import { TransformService } from "../../../../services";
import { DimensionItem, FieldItem } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import PreviewTransforms from "../../../CreateTransform/components/PreviewTransform";

interface TransformSettingsProps {
  transformService: TransformService;
  transformId: string;
  sourceIndex: string;
  transformJson: any;
  groupsShown: DimensionItem[];
  aggregationsShown: any;
}

interface TransformSettingsState {
  previewTransform: any[];
}

export default class TransformSettings extends Component<TransformSettingsProps, TransformSettingsState> {
  constructor(props: TransformSettingsProps) {
    super(props);
    this.state = {
      previewTransform: [],
    };
  }

  previewTransform = async (transform: any): Promise<void> => {
    try {
      const { transformService } = this.props;
      const previewResponse = await transformService.previewTransform(transform);
      if (previewResponse.ok) this.setState({ previewTransform: previewResponse.response.documents });
      else this.context.notifications.toasts.addDanger(`Could not preview transform: ${previewResponse.error}`);
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load preview transform"));
    }
  };

  componentDidMount = async (): Promise<void> => {
    await this.previewTransform({ transform: this.props.transformJson.transform });
  };

  render() {
    const { groupsShown, aggregationsShown } = this.props;

    const groupItems = () => {
      console.log(groupsShown);
      return groupsShown.map((group) => {
        return (
          <EuiFlexItem>
            <EuiText size="xs">
              <dt>Group by {group.aggregationMethod}</dt>
              <dd>{group.field.label}</dd>
            </EuiText>
          </EuiFlexItem>
        );
      });
    };

    const aggItems = () => {
      return Object.keys(aggregationsShown).map((key) => {
        let aggregationType = Object.keys(aggregationsShown[key])[0];
        let sourceField = aggregationsShown[key][aggregationType].field;

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
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Transform settings" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="m" />
          <EuiFlexGrid columns={4}>
            {groupItems()}
            {aggItems()}
          </EuiFlexGrid>
          <EuiSpacer size="m" />
        </div>
        <div style={{ padding: "10px" }}>
          <EuiAccordion id={htmlIdGenerator()()} buttonContent="Sample source index and transform result" onClick={this.onClick}>
            <div style={{ padding: "10px" }}>
              <EuiSpacer size={"m"} />

              {/*// TODO: Use the source data preview table from create workflow */}
              <EuiText>
                <h5>Preview result based on sample data</h5>
              </EuiText>
              <EuiSpacer size={"s"} />
              <PreviewTransforms
                onRemoveTransformation={() => {}}
                previewTransform={this.state.previewTransform}
                aggList={[]}
                isReadOnly={true}
              />
            </div>
          </EuiAccordion>
        </div>
      </ContentPanel>
    );
  }

  onClick = async () => {
    //Only call preview when preview transform is empty
    const { previewTransform } = this.state;
    if (!previewTransform.length) await this.previewTransform({ transform: this.props.transformJson.transform });
  };
}
