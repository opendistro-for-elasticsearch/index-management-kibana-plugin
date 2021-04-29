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

import { EuiDataGrid, EuiSpacer, EuiText } from "@elastic/eui";
import React, { Component } from "react";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";

interface DefineTransformsProps {
  transformId: string;
  sourceIndex: string;
}

interface DefineTransformsState {}

export default class DefineTransforms extends Component<DefineTransformsProps, DefineTransformsState> {
  constructor(props: DefineTransformsProps) {
    super(props);
    const { transfromId } = this.props;
    this.state = {};
  }

  render() {
    const { transfromId, sourceIndex } = this.props;
    return (
      <ContentPanel
        actions={
          <ContentPanelActions
            actions={[
              {
                text: "Full screen view",
                buttonProps: {
                  iconType: "fullScreen",
                  //TODO: Add action to enter full screen view

                  // onClick: () =>
                  //   onShow(ApplyPolicyModal, {
                  //     indices: selectedItems.map((item: ManagedCatIndex) => item.index),
                  //     core: this.context,
                  //   }),
                },
              },
            ]}
          />
        }
        bodyStyles={{ padding: "10px 10px" }}
        title="Select fields to transform"
        titleSize="m"
      >
        <EuiText>
          <h4>Original fields with sample data</h4>
        </EuiText>
        <EuiSpacer size="s" />
        {/*TODO: Substitute "source index", and "filtered by" fields with actual values*/}
        <EuiText color="subdued" size="xs">
          <p>{`Viewing sample data from index ${sourceIndex}, filtered by order.type:sales_order, order.success:true`}</p>
        </EuiText>
        {/*<EuiDataGrid*/}
        {/*  columns={[]}*/}
        {/*/>*/}
      </ContentPanel>
    );
  }
}
