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

import React, { useCallback, useState } from "react";
import { EuiDataGrid, EuiDataGridColumn, EuiText, EuiToolTip } from "@elastic/eui";
import PreviewEmptyPrompt from "../PreviewEmptyPrompt";
import PreviewOptions from "../PreviewOptions";
import { TransformAggItem, TransformGroupItem } from "../../../../../models/interfaces";
import { renderTime } from "../../../Transforms/utils/helpers";

interface PreviewTransformProps {
  previewTransform: any[];
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  aggList: TransformAggItem[];
  selectedAggregations: any;
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
  onRemoveTransformation: (name: string) => void;
  isReadOnly: boolean;
}

export default function PreviewTransform({
  previewTransform,
  selectedGroupField,
  onGroupSelectionChange,
  selectedAggregations,
  aggList,
  onAggregationSelectionChange,
  onRemoveTransformation,
  isReadOnly,
}: PreviewTransformProps) {
  const [previewColumns, setPreviewColumns] = useState<EuiDataGridColumn[]>([]);
  const [visiblePreviewColumns, setVisiblePreviewColumns] = useState(() => previewColumns.map(({ id }) => id).slice(0, 5));
  const [previewPagination, setPreviewPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const renderPreviewCellValue = ({ rowIndex, columnId }) => {
    if (previewTransform.hasOwnProperty(rowIndex)) {
      if (previewTransform[rowIndex][columnId]) {
        // Case for date histogram type
        //TODO: Check if there's a better way to check for date histogram types
        if (columnId.includes("date_histogram")) {
          return renderTime(previewTransform[rowIndex][columnId]);
        }

        // Case for percentile
        return typeof previewTransform[rowIndex][columnId] !== ("string" || "number")
          ? JSON.stringify(previewTransform[rowIndex][columnId])
          : previewTransform[rowIndex][columnId];
      }
    }
    return "-";
  };

  const updatePreviewColumns = (): void => {
    if (isReadOnly) {
      if (previewTransform.length) {
        let tempCol: EuiDataGridColumn[] = [];
        for (const [key, value] of Object.entries(previewTransform[0])) {
          tempCol.push({
            id: key,
            display: (
              <div>
                <EuiToolTip content={key}>
                  <EuiText size="s">
                    <b>{key}</b>
                  </EuiText>
                </EuiToolTip>
              </div>
            ),
            actions: {
              showHide: false,
              showMoveLeft: false,
              showMoveRight: false,
              showSortAsc: false,
              showSortDesc: false,
            },
          });
        }
        setPreviewColumns(tempCol);
        setVisiblePreviewColumns(() => tempCol.map(({ id }) => id).slice(0, 5));
      }
    } else {
      if (aggList.length) {
        let tempCol: EuiDataGridColumn[] = [];
        aggList.map((aggItem) => {
          tempCol.push({
            id: aggItem.name,
            display: (
              <PreviewOptions
                name={aggItem.name}
                selectedGroupField={selectedGroupField}
                onGroupSelectionChange={onGroupSelectionChange}
                aggList={aggList}
                selectedAggregations={selectedAggregations}
                onAggregationSelectionChange={onAggregationSelectionChange}
                onRemoveTransformation={onRemoveTransformation}
              />
            ),
            actions: {
              showHide: false,
              showMoveLeft: false,
              showMoveRight: false,
              showSortAsc: false,
              showSortDesc: false,
            },
          });
        });

        setPreviewColumns(tempCol);
        setVisiblePreviewColumns(() => tempCol.map(({ id }) => id));
      }
    }
  };

  React.useEffect(() => {
    updatePreviewColumns();
  }, [previewTransform, aggList]);

  return (!isReadOnly && aggList.length) || (isReadOnly && previewTransform.length) ? (
    <EuiDataGrid
      style={{ overflow: "scroll", width: "100%" }}
      aria-label="Preview transforms"
      columns={previewColumns}
      columnVisibility={{ visibleColumns: visiblePreviewColumns, setVisibleColumns: setVisiblePreviewColumns }}
      rowCount={previewTransform.length}
      renderCellValue={renderPreviewCellValue}
      toolbarVisibility={{
        showColumnSelector: true,
        showStyleSelector: false,
        showSortSelector: false,
        showFullScreenSelector: false,
      }}
      gridStyle={{ rowHover: isReadOnly ? "none" : "highlight" }}
    />
  ) : (
    <PreviewEmptyPrompt />
  );
}
