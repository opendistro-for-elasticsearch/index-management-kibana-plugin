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

import { EuiDataGrid, EuiDataGridColumn, EuiSpacer, EuiText } from "@elastic/eui";
import React, { useContext, useEffect, useState } from "react";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { FieldItem } from "../../../../../models/interfaces";
import { useCallback } from "react";
import { TransformService } from "../../../../services";

interface DefineTransformsProps {
  transformService: TransformService;
  transformId: string;
  sourceIndex: string;
  fields: FieldItem[];
}

export default function DefineTransforms({ transformService, transfromId, sourceIndex, fields }: DefineTransformsProps) {
  let columns: EuiDataGridColumn[] = [];

  fields.map((field: FieldItem) => columns.push({ id: field.label, displayAsText: field.label + " type: " + field.type }));

  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sortingColumns, setSortingColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(() => columns.map(({ id }) => id));

  const fetchData = useCallback(async () => {
    const response = await transformService.searchSampleData(sourceIndex);
    if (response.ok) console.log("Successfully searched sample data: " + JSON.stringify(response));
  }, []);

  // React.useEffect(() => {
  //   fetchData();
  // }, [ fetchData]);

  const onChangeItemsPerPage = useCallback(
    (pageSize) =>
      setPagination((pagination) => ({
        ...pagination,
        pageSize,
        pageIndex: 0,
      })),
    [setPagination]
  );
  const onChangePage = useCallback((pageIndex) => setPagination((pagination) => ({ ...pagination, pageIndex })), [setPagination]);

  const onSort = useCallback(
    (sortingColumns) => {
      setSortingColumns(sortingColumns);
    },
    [setSortingColumns]
  );

  // const renderCellValue = useMemo(() => {
  //   return ({ rowIndex, columnId, setCellProps }) => {
  //     // const data = useContext(DataContext);
  //     useEffect(() => {
  //       if (columnId === 'amount') {
  //         if (data.hasOwnProperty(rowIndex)) {
  //           const numeric = parseFloat(
  //             data[rowIndex][columnId].match(/\d+\.\d+/)[0],
  //             10
  //           );
  //           setCellProps({
  //             style: {
  //               backgroundColor: `rgba(0, 255, 0, ${numeric * 0.0002})`,
  //             },
  //           });
  //         }
  //       }
  //     }, [rowIndex, columnId, setCellProps, data]);
  //
  //     function getFormatted() {
  //       return data[rowIndex][columnId].formatted
  //         ? data[rowIndex][columnId].formatted
  //         : data[rowIndex][columnId];
  //     }
  //
  //     return data.hasOwnProperty(rowIndex)
  //       ? getFormatted(rowIndex, columnId)
  //       : null;
  //   };
  // }, []);

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
        rowCount={200}
        renderCellValue={() => {
          return null;
        }}
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
