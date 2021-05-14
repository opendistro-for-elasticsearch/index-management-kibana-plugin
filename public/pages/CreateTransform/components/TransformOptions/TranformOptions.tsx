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
import PercentilePanel from "./Panels/PercentilePanel";

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
  const isText = type == "text";

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [groupSelection, setGroupSelection] = useState<TransformGroupItem[]>(selectedGroupField);
  const [aggSelection, setAggSelection] = useState(selectedAggregations);

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleGroupSelectionChange = (newAggItem: any): void => {
    groupSelection.push(newAggItem);
    onGroupSelectionChange(groupSelection);
    closePopover();
  };
  const handleAggSelectionChange = (): void => {
    onAggregationSelectionChange(aggSelection);
    closePopover();
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
          name: "Aggregate by sum",
          onClick: () => {
            aggSelection[`sum_${name}`] = {
              sum: { field: name },
            };
            handleAggSelectionChange();
          },
        },
        {
          name: "Aggregate by max",
          onClick: () => {
            aggSelection[`max_${name}`] = {
              max: { field: name },
            };
            handleAggSelectionChange();
          },
        },
        {
          name: "Aggregate by min",
          onClick: () => {
            aggSelection[`min_${name}`] = {
              min: { field: name },
            };
            handleAggSelectionChange();
          },
        },
        {
          name: "Aggregate by avg",
          onClick: () => {
            aggSelection[`avg_${name}`] = {
              avg: { field: name },
            };
            handleAggSelectionChange();
          },
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange();
          },
        },
        {
          name: "Aggregate by percentile",
          panel: 2,
        },
        {
          name: "Aggregate by scripted metrics",
          panel: 3,
        },
      ],
    },
    {
      id: 1,
      title: "Back",
      content: <HistogramPanel name={name} handleGroupSelectionChange={handleGroupSelectionChange} closePopover={closePopover} />,
    },
    {
      id: 2,
      title: "Back",
      content: (
        <PercentilePanel
          name={name}
          aggSelection={aggSelection}
          handleAggSelectionChange={handleAggSelectionChange}
          closePopover={closePopover}
        />
      ),
    },
    {
      id: 3,
      title: "Back",
    },
  ];
  const datePanels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "Transform options",
      items: [
        {
          name: "Group by date histogram",
          panel: 1,
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange();
          },
        },
      ],
    },
    {
      id: 1,
      title: "Back",
      items: [
        {
          name: "Millisecond",
          onClick: () => {
            groupSelection.push({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_millisecond`,
                fixed_interval: "1ms",
              },
            });
          },
        },
        {
          name: "Second",
          onClick: () => {
            handleGroupSelectionChange({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_second`,
                fixed_interval: "1s",
              },
            });
          },
        },
        {
          name: "Minute",
          onClick: () => {
            handleGroupSelectionChange({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_minute`,
                fixed_interval: "1m",
              },
            });
          },
        },
        {
          name: "Hour",
          onClick: () => {
            handleGroupSelectionChange({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_hour`,
                fixed_interval: "1h",
              },
            });
          },
        },
        {
          name: "Day",
          onClick: () => {
            handleGroupSelectionChange({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_day`,
                calendar_interval: "1d",
              },
            });
          },
        },
        {
          name: "Week",
          onClick: () => {
            handleGroupSelectionChange({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_week`,
                calendar_interval: "1w",
              },
            });
          },
        },
        {
          name: "Month",
          onClick: () => {
            handleGroupSelectionChange({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_month`,
                calendar_interval: "1M",
              },
            });
          },
        },
        {
          name: "Quarter",
          onClick: () => {
            handleGroupSelectionChange({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_quarter`,
                calendar_interval: "1q",
              },
            });
          },
        },
        {
          name: "Year",
          onClick: () => {
            handleGroupSelectionChange({
              date_histogram: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.dateHistogram}_year`,
                calendar_interval: "1y",
              },
            });
          },
        },
      ],
    },
  ];
  const textPanels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "Transform options",
      items: [
        {
          name: "No options available for text fields",
        },
      ],
    },
  ];
  const keywordPanels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "Transform options",
      items: [
        {
          name: "Group by terms",
          onClick: () => {
            handleGroupSelectionChange({
              terms: {
                source_field: name,
                target_field: `${name}_${GROUP_TYPES.terms}`,
              },
            });
          },
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange();
          },
        },
      ],
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
            <EuiContextMenu initialPanelId={0} panels={isNumeric ? panels : isText ? textPanels : isDate ? datePanels : keywordPanels} />
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
