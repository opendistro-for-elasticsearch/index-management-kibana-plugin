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

import { EuiDataGrid, EuiDataGridCellValueElementProps, EuiDataGridColumn, EuiSpacer, EuiText } from "@elastic/eui";
import { CoreStart } from "kibana/public";
import React, { useState, useCallback, useEffect, Component } from "react";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { FieldItem } from "../../../../../models/interfaces";
import { TransformService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { useMemo } from "react";
import { RollupQueryParams } from "../../../Rollups/models/interfaces";

interface DefineTransformsProps {
  transformService: TransformService;
  notifications: CoreStart["notifications"];
  transformId: string;
  sourceIndex: string;
  fields: FieldItem[];
}

export default function DefineTransforms({ transformService, notifications, transfromId, sourceIndex, fields }: DefineTransformsProps) {
  let columns: EuiDataGridColumn[] = [];

  fields.map((field: FieldItem) => columns.push({ id: field.label, displayAsText: field.label + " type: " + field.type }));

  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [from, setFrom] = useState(0);
  const [size, setSize] = useState(10);
  const [sortingColumns, setSortingColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(() => columns.map(({ id }) => id));
  const [data, setData] = useState([]);
  const [dataCount, setDataCount] = useState(0);

  const fetchData = useCallback(async () => {
    console.log("Entering fetchData...");
    setLoading(true);
    try {
      const response = await transformService.searchSampleData(sourceIndex, { from, size });

      if (response.ok) {
        //Debug use
        console.log("Successfully searched sample data: " + JSON.stringify(response));
        setData(response.response.data);
        setDataCount(response.response.total.value);
        // console.log("First item: " + JSON.stringify(response.response.data[0]));
      }
    } catch (err) {
      notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the rollups"));
    }
    setLoading(false);
  }, [sourceIndex]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      //debug use
      console.log("From: " + pageIndex * size);
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
    //Debug use
    console.log("rowIndex: " + rowIndex + " columnId: " + columnId + " data: " + JSON.stringify(data[rowIndex]._source[columnId]));
    if (!loading && data.hasOwnProperty(rowIndex)) return data[rowIndex]._source[columnId] ? data[rowIndex]._source[columnId] : null;
    return null;
  };

  return (
    <ContentPanel
      actions={
        <ContentPanelActions
          actions={[
            {
              text: "Full screen view",
              buttonProps: {
                iconType: "fullScreen",
                //TODO: Add action to enter full screen view

                // onClick: () =>
                //   onShow(ApplyPolicyModal, {
                //     indices: selectedItems.map((item: ManagedCatIndex) => item.index),
                //     core: this.context,
                //   }),
              },
            },
          ]}
        />
      }
      bodyStyles={{ padding: "10px 10px" }}
      title="Select fields to transform"
      titleSize="m"
    >
      <EuiText>
        <h4>Original fields with sample data</h4>
      </EuiText>
      <EuiSpacer size="s" />
      {/*TODO: Substitute "source index", and "filtered by" fields with actual values*/}
      <EuiText color="subdued" size="xs">
        <p>{`Viewing sample data from index ${sourceIndex}, filtered by order.type:sales_order, order.success:true`}</p>
      </EuiText>
      <EuiSpacer size="s" />
      {/*TODO: add rowCount*/}
      <EuiDataGrid
        aria-label="Define transforms"
        columns={columns}
        columnVisibility={{ visibleColumns, setVisibleColumns }}
        rowCount={dataCount}
        renderCellValue={
          // ({ rowIndex, columnId }) => {
          //   //Debug use
          //   console.log("rowIndex: " + rowIndex + " columnId: " + columnId + " data: " + JSON.stringify(data[rowIndex]._source[columnId]));
          //   // return data[rowIndex];
          //   if (!loading && data.hasOwnProperty(rowIndex))
          //     return data[rowIndex]._source[columnId] ? data[rowIndex]._source[columnId] : null;
          //   return null;
          // }

          //   ({ rowIndex, columnId }) =>
          //   `${rowIndex}, ${columnId}`
          renderCellValue
        }
        // renderCellValue={({}) => null}
        sorting={{ columns: sortingColumns, onSort }}
        pagination={{
          ...pagination,
          pageSizeOptions: [5, 10, 20, 50],
          onChangeItemsPerPage: onChangeItemsPerPage,
          onChangePage: onChangePage,
        }}
      />
    </ContentPanel>
  );
}
