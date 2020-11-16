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
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiIcon, EuiFlexGroup } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { RollupMetadata } from "../../../../../models/interfaces";
import { renderTime } from "../../../Rollups/utils/helpers";

interface RollupStatusProps {
  metadata: RollupMetadata | null;
}

const RollupStatus = ({ metadata }: RollupStatusProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Rollup status" titleSize="m">
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiFlexGrid columns={4}>
        <EuiFlexItem>
          <EuiText size="xs">
            <dt>Current rollup window</dt>
            <dd>
              {metadata == null || metadata.rollupMetadata == null || metadata.rollupMetadata.continuous == null
                ? "-"
                : renderTime(metadata.rollupMetadata.continuous.nextWindowStartTime) +
                  " - " +
                  renderTime(metadata.rollupMetadata.continuous.nextWindowEndTime)}
            </dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs">
            <dt>Status</dt>
            {metadata == null || metadata.rollupMetadata == null ? (
              <dd>-</dd>
            ) : metadata.rollupMetadata.status == "failed" ? (
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiIcon size="s" type="alert" color="danger" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="danger">
                    {"Failed:" + metadata.rollupMetadata.failureReason}
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            ) : metadata.rollupMetadata.status == "finished" ? (
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiIcon size="s" type="check" color="success" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="secondary">
                    Complete
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            ) : metadata.rollupMetadata.status == "init" ? (
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiIcon size="s" type="clock" color="primary" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" style={{ color: "#006BB4" }}>
                    Initializing
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            ) : metadata.rollupMetadata.status == "started" ? (
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiIcon size="s" type="play" color="success" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="secondary">
                    Started
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            ) : metadata.rollupMetadata.status == "stopped" ? (
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiIcon size="s" type="stop" color="subdued" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="subdued">
                    Stopped
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            ) : (
              <dd>-</dd>
            )}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs">
            <dt>Rollup indexed</dt>
            <dd>{metadata == null || metadata.rollupMetadata == null ? "-" : metadata.rollupMetadata.stats.rollups_indexed}</dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs">
            <dt>Indexed time (ms)</dt>
            <dd>{metadata == null || metadata.rollupMetadata == null ? "-" : metadata.rollupMetadata.stats.index_time_in_millis}</dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem></EuiFlexItem>
        <EuiFlexItem></EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs">
            <dt>Document processed</dt>
            <dd>{metadata == null || metadata.rollupMetadata == null ? "-" : metadata.rollupMetadata.stats.documents_processed}</dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs">
            <dt>Search time (ms)</dt>
            <dd>{metadata == null || metadata.rollupMetadata == null ? "-" : metadata.rollupMetadata.stats.search_time_in_millis}</dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem></EuiFlexItem>
        <EuiFlexItem></EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs">
            <dt>Page processed</dt>
            <dd>{metadata == null || metadata.rollupMetadata == null ? "-" : metadata.rollupMetadata.stats.pages_processed}</dd>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGrid>
      <EuiSpacer size="s" />
    </div>
  </ContentPanel>
);
export default RollupStatus;
