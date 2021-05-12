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
import { EuiButtonIcon, EuiContextMenu, EuiFlexGroup, EuiFlexItem, EuiPopover } from "@elastic/eui";
import { useState } from "react";
import { isNumericMapping } from "../../utils/helpers";

interface TransformOptionsProps {
  name: string;
  type?: string;
}

export default function TransformOptions({ name, type }: TransformOptionsProps) {
  const isNumeric = isNumericMapping(type);
  const isDate = type == "date";

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const panels = [
    {
      id: 0,
      title: "This is a context menu",
      items: [
        {
          name: "Handle an onClick",
          icon: "search",
        },
        {
          name: "Go to a link",
          icon: "user",
          href: "http://elastic.co",
          target: "_blank",
        },
        {
          name: "Nest panels",
          icon: "wrench",
          panel: 1,
        },
        {
          name: "Add a tooltip",
          icon: "document",
          toolTipTitle: "Optional tooltip",
          toolTipContent: "Optional content for a tooltip",
          toolTipPosition: "right",
        },
        {
          name: "Use an app icon",
          icon: "visualizeApp",
        },
      ],
    },
    {
      id: 1,
      initialFocusedItemIndex: 1,
      title: "Nest panels",
      items: [
        {
          name: "PDF reports",
          icon: "user",
        },
        {
          name: "Embed code",
          icon: "user",
          panel: 2,
        },
        {
          name: "Permalinks",
          icon: "user",
        },
      ],
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
            anchorPosition="downLeft"
          >
            <EuiContextMenu initialPanelId={0} panels={panels} />
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
