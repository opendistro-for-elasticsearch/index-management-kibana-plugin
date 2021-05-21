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

import { GROUP_TYPES, TRANSFORM_AGG_TYPE, TransformAggItem, TransformGroupItem } from "../../../../../../../models/interfaces";
import React, { useState } from "react";
import { EuiButton, EuiFieldNumber, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiPanel, EuiSpacer } from "@elastic/eui";
interface HistogramPanelProps {
  name: string;
  handleGroupSelectionChange: (newGroupItem: TransformGroupItem, type: TRANSFORM_AGG_TYPE, name: string) => void;
  aggList: TransformAggItem[];
  closePopover: () => void;
}

export default function HistogramPanel({ name, handleGroupSelectionChange, closePopover }: HistogramPanelProps) {
  const [histogramInterval, setHistogramInterval] = useState(5);

  return (
    <EuiPanel>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: 109 }}>
          <EuiFormRow label="Histogram interval">
            <EuiFieldNumber value={histogramInterval} onChange={(e) => setHistogramInterval(e.target.valueAsNumber)} />
          </EuiFormRow>
          <EuiSpacer size="s" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}></EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup justifyContent={"flexEnd"} gutterSize={"m"}>
        <EuiFlexItem grow={false}>
          <EuiButton fullWidth={false} onClick={() => closePopover()} style={{ minWidth: 84 }}>
            Cancel
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            fullWidth={false}
            onClick={() => {
              const targetFieldName = `${name} _${GROUP_TYPES.histogram}_${histogramInterval}`;
              handleGroupSelectionChange(
                {
                  histogram: {
                    source_field: name,
                    target_field: targetFieldName,
                    interval: histogramInterval,
                  },
                },
                TRANSFORM_AGG_TYPE.histogram,
                targetFieldName
              );
            }}
            style={{ minWidth: 55 }}
          >
            OK
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
