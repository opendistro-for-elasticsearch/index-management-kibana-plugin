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

import React, { useState } from "react";
import {
  EuiButtonIcon,
  EuiContextMenu,
  EuiContextMenuPanelDescriptor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiText,
  EuiToolTip,
} from "@elastic/eui";
import { isNumericMapping } from "../../utils/helpers";
import { GROUP_TYPES, TRANSFORM_AGG_TYPE, TransformAggItem, TransformGroupItem } from "../../../../../models/interfaces";
import HistogramPanel from "./Panels/HistogramPanel";
import PercentilePanel from "./Panels/PercentilePanel";

interface TransformOptionsProps {
  name: string;
  type?: string;
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  selectedAggregations: any;
  aggList: TransformAggItem[];
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
}

export default function TransformOptions({
  name,
  type,
  selectedGroupField,
  onGroupSelectionChange,
  selectedAggregations,
  aggList,
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

  const handleGroupSelectionChange = (newAggItem: any, type: TRANSFORM_AGG_TYPE, name: string): void => {
    groupSelection.push(newAggItem);
    onGroupSelectionChange(groupSelection, {
      type,
      name,
      item: newAggItem,
    });
    closePopover();
  };
  const handleAggSelectionChange = (aggItem: TransformAggItem): void => {
    onAggregationSelectionChange(aggSelection, aggItem);
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
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.sum,
              name: `sum_${name}`,
              item: { sum: { field: name } },
            };
            aggSelection[`sum_${name}`] = {
              sum: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by max",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.max,
              name: `max_${name}`,
              item: { max: { field: name } },
            };
            aggSelection[`max_${name}`] = {
              max: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by min",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.min,
              name: `min_${name}`,
              item: { min: { field: name } },
            };
            aggSelection[`min_${name}`] = {
              min: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by avg",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.avg,
              name: `avg_${name}`,
              item: { avg: { field: name } },
            };
            aggSelection[`avg_${name}`] = {
              avg: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.value_count,
              name: `count_${name}`,
              item: { value_count: { field: name } },
            };
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
        {
          name: "Aggregate by percentile",
          panel: 2,
        },
        // {
        //   name: "Aggregate by scripted metrics",
        //   panel: 3,
        // },
      ],
    },
    {
      id: 1,
      title: "Back",
      content: (
        <HistogramPanel name={name} handleGroupSelectionChange={handleGroupSelectionChange} aggList={aggList} closePopover={closePopover} />
      ),
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
    // {
    //   id: 3,
    //   title: "Back",
    // },
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
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.value_count,
              name: `count_${name}`,
              item: { value_count: { field: name } },
            };
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange(aggItem);
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
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_millisecond`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  fixed_interval: "1ms",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
          },
        },
        {
          name: "Second",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_second`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  fixed_interval: "1s",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
          },
        },
        {
          name: "Minute",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_minute`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  fixed_interval: "1m",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
          },
        },
        {
          name: "Hour",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_hour`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  fixed_interval: "1h",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
          },
        },
        {
          name: "Day",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_day`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  calendar_interval: "1d",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
          },
        },
        {
          name: "Week",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_week`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  calendar_interval: "1w",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
          },
        },
        {
          name: "Month",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_month`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  calendar_interval: "1M",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
          },
        },
        {
          name: "Quarter",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_quarter`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  calendar_interval: "1q",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
          },
        },
        {
          name: "Year",
          onClick: () => {
            const targetField = `${name}_${GROUP_TYPES.dateHistogram}_year`;
            handleGroupSelectionChange(
              {
                date_histogram: {
                  source_field: name,
                  target_field: targetField,
                  calendar_interval: "1y",
                },
              },
              TRANSFORM_AGG_TYPE.date_histogram,
              targetField
            );
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
            const targetField = `${name}_${GROUP_TYPES.terms}`;
            handleGroupSelectionChange(
              {
                terms: {
                  source_field: name,
                  target_field: targetField,
                },
              },
              TRANSFORM_AGG_TYPE.terms,
              targetField
            );
          },
        },
        {
          name: "Aggregate by count",
          onClick: () => {
            const aggItem: TransformAggItem = {
              type: TRANSFORM_AGG_TYPE.value_count,
              name: `count_${name}`,
              item: { value_count: { field: name } },
            };
            aggSelection[`count_${name}`] = {
              value_count: { field: name },
            };
            handleAggSelectionChange(aggItem);
          },
        },
      ],
    },
  ];

  const button = <EuiButtonIcon iconType="plusInCircleFilled" onClick={() => setIsPopoverOpen(!isPopoverOpen)} />;

  return (
    <div>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem style={{ textOverflow: "ellipsis" }} className="eui-textTruncate" grow={false}>
          <EuiToolTip content={name}>
            <EuiText size="s">
              <b>{name}</b>
            </EuiText>
          </EuiToolTip>
        </EuiFlexItem>
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
