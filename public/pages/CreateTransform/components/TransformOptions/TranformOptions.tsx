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

import React from "react";
import {
  EuiButton,
  EuiButtonIcon,
  EuiContextMenu,
  EuiContextMenuPanelDescriptor,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiPopover,
} from "@elastic/eui";
import { useState } from "react";
import { isNumericMapping } from "../../utils/helpers";
import { GROUP_TYPES, TransformGroupItem } from "../../../../../models/interfaces";

interface TransformOptionsProps {
  name: string;
  type?: string;
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[]) => void;
  selectedAggregations: any;
  onAggregationSelectionChange: (selectedFields: any) => void;
}

export default function TransformOptions({
  name,
  type,
  selectedGroupField,
  onGroupSelectionChange,
  selectedAggregations,
  onAggregationSelectionChange,
}: TransformOptionsProps) {
  const isNumeric = isNumericMapping(type);
  const isDate = type == "date";

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [histogramInterval, setHistogramInterval] = useState(5);
  const [groupSelection, setGroupSelection] = useState<TransformGroupItem[]>(selectedGroupField);
  const [aggSelection, setAggSelection] = useState(selectedAggregations);

  const panels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "Transform options",
      items: [
        {
          name: "Group by histogram",
          panel: 1,
        },
        {
          name: "Group by date histogram",
        },
        {
          name: "Group by terms",
        },
        {
          name: "Aggregate by sum",
        },
        {
          name: "Aggregate by max",
        },
        {
          name: "Aggregate by min",
        },
        {
          name: "Aggregate by avg",
        },
        {
          name: "Aggregate by count",
        },
        {
          name: "Aggregate by percentile",
        },
        {
          name: "Aggregate by scripted metrics",
        },
      ],
    },
    {
      id: 1,
      title: "Back",
      content: (
        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiFormRow label="Histogram interval">
                <EuiFieldNumber value={histogramInterval} onChange={(e) => setHistogramInterval(e.target.valueAsNumber)} />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}></EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiButton fullWidth={false} onClick={() => closePopover()}>
                Cancel
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                fullWidth={false}
                onClick={() => {
                  const targetFieldName = `${name} _${GROUP_TYPES.histogram}`;
                  groupSelection.push({
                    histogram: {
                      source_field: name,
                      target_field: targetFieldName,
                      interval: histogramInterval,
                    },
                  });
                  onGroupSelectionChange(groupSelection);
                }}
              >
                OK
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      ),
    },
  ];

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const button = <EuiButtonIcon iconType="plusInCircleFilled" onClick={() => setIsPopoverOpen(!isPopoverOpen)} />;

  return (
    <div>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>{name}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="contextMenuExample"
            button={button}
            isOpen={isPopoverOpen}
            closePopover={closePopover}
            panelPaddingSize="none"
            anchorPosition="rightCenter"
          >
            <EuiContextMenu initialPanelId={0} panels={panels} size="s" />
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
