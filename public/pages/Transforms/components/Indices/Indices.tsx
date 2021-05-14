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
import { ContentPanel } from "../../../../components/ContentPanel";

interface IndicesProps {
  sourceIndex: string;
  targetIndex: string;
  sourceIndexFilter: string;
}

export default class Indices extends Component<IndicesProps> {
 constructor(props: IndicesProps) {
   super(props);
 }

 render() {
   const { sourceIndex, targetIndex, sourceIndexFilter } = this.props;

   return (
     <ContentPanel bodyStyles={{ padding: "initial" }} title="Indices" titleSize="m">
      <div style={{ paddingLeft: "10px" }}>
        <EuiText size="xs">
          <dt>Source index</dt>
          <dd>{sourceIndex}</dd>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiText size="xs">
          <dt>Source index filter</dt>
          <dd>{sourceIndexFilter}</dd>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiText size="xs">
          <dt>Target index</dt>
          <dd>{targetIndex}</dd>
        </EuiText>
      </div>
     </ContentPanel>
   )
 }
}
