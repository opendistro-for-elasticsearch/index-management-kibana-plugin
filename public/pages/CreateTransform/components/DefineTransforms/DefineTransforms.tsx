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

import { EuiDataGrid, EuiDataGridColumn, EuiSpacer, EuiText, EuiToolTip } from "@elastic/eui";
import { CoreStart } from "kibana/public";
import React, { useCallback, useState } from "react";
import { ContentPanel } from "../../../../components/ContentPanel";
import { FieldItem, TransformAggItem, TransformGroupItem } from "../../../../../models/interfaces";
import { TransformService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import PreviewTransform from "../PreviewTransform";
import TransformOptions from "../TransformOptions";
import { DefaultSampleDataSize } from "../../utils/constants";
import { renderTime } from "../../../Transforms/utils/helpers";

interface DefineTransformsProps {
  transformService: TransformService;
  notifications: CoreStart["notifications"];
  sourceIndex: string;
  fields: FieldItem[];
  selectedGroupField: TransformGroupItem[];
  onGroupSelectionChange: (selectedFields: TransformGroupItem[], aggItem: TransformAggItem) => void;
  selectedAggregations: any;
  aggList: TransformAggItem[];
  onAggregationSelectionChange: (selectedFields: any, aggItem: TransformAggItem) => void;
  onRemoveTransformation: (name: string) => void;
  previewTransform: any[];
  isReadOnly: boolean;
}

export default function DefineTransforms({
  transformService,
  notifications,
  sourceIndex,
  fields,
  selectedGroupField,
  onGroupSelectionChange,
  selectedAggregations,
  aggList,
  onAggregationSelectionChange,
  onRemoveTransformation,
  previewTransform,
  isReadOnly,
}: DefineTransformsProps) {
  let columns: EuiDataGridColumn[] = [];

  fields.map((field: FieldItem) => {
    columns.push({
      id: field.label,
      display: isReadOnly ? (
        <div>
          <EuiToolTip content={field.label}>
            <EuiText size="s">
              <b>{field.label}</b>
            </EuiText>
          </EuiToolTip>
        </div>
      ) : (
        <TransformOptions
          name={field.label}
          type={field.type}
          selectedGroupField={selectedGroupField}
          onGroupSelectionChange={onGroupSelectionChange}
          aggList={aggList}
          selectedAggregations={selectedAggregations}
          onAggregationSelectionChange={onAggregationSelectionChange}
        />
      ),
      schema: field.type,
      actions: {
        showHide: false,
        showMoveLeft: false,
        showMoveRight: false,
        showSortAsc: false,
        showSortDesc: false,
      },
    });
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [from, setFrom] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [sortingColumns, setSortingColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(() => columns.map(({ id }) => id).slice(0, 5));
  const [data, setData] = useState([]);
  const [dataCount, setDataCount] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await transformService.searchSampleData(sourceIndex, { from: 0, size: DefaultSampleDataSize });

      if (response.ok) {
        setData(response.response.data);
        setDataCount(response.response.total.value);
      }
    } catch (err) {
      notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the transforms"));
    }
    setLoading(false);
  }, [sourceIndex]);

  React.useEffect(() => {
    fetchData();
  }, []);

  const onChangeItemsPerPage = useCallback(
    (pageSize) => {
      setPagination((pagination) => ({
        ...pagination,
        pageSize,
        pageIndex: 0,
      }));
      setFrom(0);
      setSize(pageSize);
    },
    [setPagination]
  );
  const onChangePage = useCallback(
    (pageIndex) => {
      setPagination((pagination) => ({ ...pagination, pageIndex }));
      setFrom(pageIndex * size);
    },
    [setPagination]
  );

  const onSort = useCallback(
    (sortingColumns) => {
      setSortingColumns(sortingColumns);
    },
    [setSortingColumns]
  );

  const renderCellValue = ({ rowIndex, columnId }) => {
    if (!loading && data.hasOwnProperty(rowIndex)) {
      if (columns?.find((column) => column.id == columnId).schema == "keyword") {
        // Remove the keyword postfix for getting correct data from array
        const correspondingTextColumnId = columnId.replace(".keyword", "");
        return data[rowIndex]._source[correspondingTextColumnId] ? data[rowIndex]._source[correspondingTextColumnId] : "-";
      } else if (columns?.find((column) => column.id == columnId).schema == "date") {
        return data[rowIndex]._source[columnId] ? renderTime(data[rowIndex]._source[columnId]) : "-";
      }
      return data[rowIndex]._source[columnId] ? data[rowIndex]._source[columnId] : "-";
    }
    return "-";
  };

  //TODO: remove duplicate code here after extracting the first table as separate component
  if (isReadOnly)
    return (
      <div>
        <EuiText>
          <h5>Original fields with sample data</h5>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiDataGrid
          style={{ overflow: "scroll", width: "100%" }}
          aria-label="Define transforms"
          columns={columns}
          columnVisibility={{ visibleColumns, setVisibleColumns }}
          rowCount={Math.min(dataCount, DefaultSampleDataSize)}
          renderCellValue={renderCellValue}
          sorting={{ columns: sortingColumns, onSort }}
          pagination={{
            ...pagination,
            pageSizeOptions: [5, 10, 20, 50],
            onChangeItemsPerPage: onChangeItemsPerPage,
            onChangePage: onChangePage,
          }}
          toolbarVisibility={{
            showColumnSelector: true,
            showStyleSelector: false,
            showSortSelector: false,
            showFullScreenSelector: false,
          }}
          gridStyle={{ rowHover: "none" }}
        />
        <EuiSpacer size="l" />
        <EuiText>
          <h5>Transformed fields preview based on sample data</h5>
        </EuiText>
        <EuiSpacer size="s" />
        <PreviewTransform
          previewTransform={previewTransform}
          aggList={aggList}
          onRemoveTransformation={onRemoveTransformation}
          isReadOnly={isReadOnly}
        />
      </div>
    );

  return (
    <ContentPanel
      //TODO: Add action to enter full screen view
      // actions={
      //   <ContentPanelActions
      //     actions={[
      //       {
      //         text: "Full screen view",
      //         buttonProps: {
      //           iconType: "fullScreen",
      //           // onClick: () =>
      //           //   onShow(ApplyPolicyModal, {
      //           //     indices: selectedItems.map((item: ManagedCatIndex) => item.index),
      //           //     core: this.context,
      //           //   }),
      //         },
      //       },
      //     ]}
      //   />
      // }
      panelStyles={{ padding: "20px 20px" }}
      bodyStyles={{ padding: "10px" }}
      title="Select fields to transform"
      titleSize="m"
    >
      <EuiText>
        <h5>Original fields with sample data</h5>
      </EuiText>
      <EuiSpacer size="s" />
      {/*TODO: Substitute "source index", and "filtered by" fields with actual values*/}
      <EuiText color="subdued" size="xs">
        <p>{`Viewing sample data from index ${sourceIndex}`}</p>
      </EuiText>
      <EuiSpacer size="s" />

      <EuiDataGrid
        aria-label="Define transforms"
        columns={columns}
        columnVisibility={{ visibleColumns, setVisibleColumns }}
        rowCount={Math.min(dataCount, DefaultSampleDataSize)}
        renderCellValue={renderCellValue}
        sorting={{ columns: sortingColumns, onSort }}
        pagination={{
          ...pagination,
          pageSizeOptions: [5, 10, 20, 50],
          onChangeItemsPerPage: onChangeItemsPerPage,
          onChangePage: onChangePage,
        }}
        toolbarVisibility={{
          showColumnSelector: true,
          showStyleSelector: false,
          showSortSelector: false,
          showFullScreenSelector: false,
        }}
      />
      <EuiSpacer size="l" />
      <EuiText>
        <h5>Transformed fields preview based on sample data</h5>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiText color="subdued" size="xs">
        <p>This fields preview displays only the first 10 results of your transform job.</p>
      </EuiText>
      <EuiSpacer size="s" />
      <PreviewTransform
        previewTransform={previewTransform}
        aggList={aggList}
        onRemoveTransformation={onRemoveTransformation}
        isReadOnly={isReadOnly}
      />
    </ContentPanel>
  );
}
