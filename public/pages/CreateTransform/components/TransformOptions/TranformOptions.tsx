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
import { EuiButtonIcon, EuiContextMenu, EuiContextMenuPanelDescriptor, EuiFlexGroup, EuiFlexItem, EuiPopover } from "@elastic/eui";
import { useState } from "react";
import { isNumericMapping } from "../../utils/helpers";
import { GROUP_TYPES, TransformGroupItem } from "../../../../../models/interfaces";
import HistogramPanel from "./Panels/HistogramPanel";

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

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

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
          panel: 2,
        },
        {
          name: "Group by terms",
          onClick: () => {
            groupSelection.push({
              terms: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.terms}`,
              },
            });
            onGroupSelectionChange(groupSelection);
          },
        },
        {
          name: "Aggregate by sum",
          onClick: () => {
            aggSelection[`sum_${name}`] = {
              sum: { field: name },
            };
            onAggregationSelectionChange(aggSelection);
          },
        },
        {
          name: "Aggregate by max",
          onClick: () => {
            aggSelection[`max_${name}`] = {
              max: { field: name },
            };
            onAggregationSelectionChange(aggSelection);
          },
        },
        {
          name: "Aggregate by min",
          onClick: () => {
            aggSelection[`min_${name}`] = {
              min: { field: name },
            };
            onAggregationSelectionChange(aggSelection);
          },
        },
        {
          name: "Aggregate by avg",
          onClick: () => {
            aggSelection[`avg_${name}`] = {
              avg: { field: name },
            };
            onAggregationSelectionChange(aggSelection);
          },
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            onAggregationSelectionChange(aggSelection);
          },
        },
        {
          name: "Aggregate by percentile",
          panel: 3,
        },
        {
          name: "Aggregate by scripted metrics",
          panel: 4,
        },
      ],
    },
    {
      id: 1,
      title: "Back",
      content: (
        <HistogramPanel
          name={name}
          groupSelection={groupSelection}
          onGroupSelectionChange={onGroupSelectionChange}
          closePopover={closePopover}
        />
      ),
    },
    {
      id: 2,
      title: "Back",
      items: [
        {
          name: "Millisecond",
        },
        {
          name: "Second",
        },
        {
          name: "Minute",
        },
        {
          name: "Hour",
        },
        {
          name: "Day",
        },
        {
          name: "Week",
        },
        {
          name: "Month",
        },
        {
          name: "Quarter",
        },
        {
          name: "Year",
        },
      ],
    },
    {
      id: 3,
      title: "Back",
    },
    {
      id: 4,
      title: "Back",
    },
  ];

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
            <EuiContextMenu initialPanelId={0} panels={panels} />
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
