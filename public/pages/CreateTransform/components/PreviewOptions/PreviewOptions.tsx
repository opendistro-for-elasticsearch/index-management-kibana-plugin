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
import { TransformAggItem, TransformGroupItem } from "../../../../../models/interfaces";

interface PreviewOptionsProps {
  name: string;
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[]) => void;
  aggList: TransformAggItem[];
  selectedAggregations: any;
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
}

export default function PreviewOptions({
  name,
  selectedGroupField,
  onGroupSelectionChange,
  selectedAggregations,
  aggList,
  onAggregationSelectionChange,
}: PreviewOptionsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const button = <EuiButtonIcon iconType="pencil" onClick={() => setIsPopoverOpen(!isPopoverOpen)} />;

  const panels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: "",
      items: [
        {
          name: "Remove transformation",
          onClick: () => {
            // Remove this transform
          },
        },
      ],
    },
  ];

  return (
    <div>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>{name}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="previewColumnPopover"
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
