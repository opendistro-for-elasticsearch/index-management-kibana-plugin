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
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiIcon } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { RollupMetadata } from "../../../../../models/interfaces";
import { renderTime } from "../../../Rollups/utils/helpers";

interface RollupStatusProps {
  metadata: RollupMetadata | null;
}

export default class RollupStatus extends Component<RollupStatusProps> {
  constructor(props: RollupStatusProps) {
    super(props);
  }

  render() {
    const { metadata } = this.props;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Rollup status" titleSize="m">
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size={"s"} />
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Current rollup window</dt>
                <dd>
                  {metadata == null || metadata.rollup_metadata == null || metadata.rollup_metadata.continuous == null
                    ? "-"
                    : renderTime(metadata.rollup_metadata.continuous.next_window_start_time) +
                      " - " +
                      renderTime(metadata.rollup_metadata.continuous.next_window_end_time)}
                </dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Status</dt>
                <dd>
                  {!(metadata == null || metadata.rollup_metadata == null) && metadata.rollup_metadata.status == "failed" ? (
                    <EuiIcon type={"alert"} color={"danger"} />
                  ) : (
                    ""
                  )}
                  {metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.status}
                </dd>
                <dd>
                  {!(metadata == null || metadata.rollup_metadata == null) && metadata.rollup_metadata.status == "failed"
                    ? "Failure reason: " + metadata.rollup_metadata.failure_reason
                    : ""}
                </dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Rollup indexed</dt>
                <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.rollups_indexed}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Indexed time (ms)</dt>
                <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.index_time_in_millis}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem></EuiFlexItem>
            <EuiFlexItem></EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Document processed</dt>
                <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.documents_processed}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Search time (ms)</dt>
                <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.search_time_in_millis}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem></EuiFlexItem>
            <EuiFlexItem></EuiFlexItem>
            <EuiFlexItem>
              <EuiText size={"xs"}>
                <dt>Page processed</dt>
                <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.pages_processed}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size={"s"} />
        </div>
      </ContentPanel>
    );
  }
}
