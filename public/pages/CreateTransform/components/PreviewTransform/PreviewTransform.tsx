import React, { useCallback, useState } from "react";
import { EuiDataGrid, EuiDataGridColumn } from "@elastic/eui";
import PreviewEmptyPrompt from "../PreviewEmptyPrompt";

interface PreviewTransformsProps {
  previewTransform: any[];
}

export default function PreviewTransforms({ previewTransform }: PreviewTransformsProps) {
  const [previewColumns, setPreviewColumns] = useState<EuiDataGridColumn[]>([]);
  const [visiblePreviewColumns, setVisiblePreviewColumns] = useState(() => previewColumns.map(({ id }) => id).slice(0, 5));
  const [previewPagination, setPreviewPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const renderPreviewCellValue = ({ rowIndex, columnId }) => {
    if (previewTransform.hasOwnProperty(rowIndex)) {
      return previewTransform[rowIndex][columnId] ? previewTransform[rowIndex][columnId] : "-";
    }
    return "-";
  };
  const onChangePreviewPerPage = useCallback(
    (pageSize) => {
      setPreviewPagination((previewPagination) => ({
        ...previewPagination,
        pageSize,
        pageIndex: 0,
      }));
    },
    [setPreviewPagination]
  );

  const onChangePreviewPage = useCallback(
    (pageIndex) => {
      setPreviewPagination((previewPagination) => ({ ...previewPagination, pageIndex }));
    },
    [setPreviewPagination]
  );

  const updatePreviewColumns = (): void => {
    if (previewTransform.length) {
      let tempCol: EuiDataGridColumn[] = [];
      for (const [key, value] of Object.entries(previewTransform[0])) {
        tempCol.push({
          id: key,
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
  };

  React.useEffect(() => {
    updatePreviewColumns();
  }, [previewTransform]);

  return previewTransform.length ? (
    <EuiDataGrid
      aria-label="Preview transforms"
      columns={previewColumns}
      columnVisibility={{ visibleColumns: visiblePreviewColumns, setVisibleColumns: setVisiblePreviewColumns }}
      rowCount={previewTransform.length}
      renderCellValue={renderPreviewCellValue}
      pagination={{
        ...previewPagination,
        pageSizeOptions: [5, 10, 20, 50],
        onChangeItemsPerPage: onChangePreviewPerPage,
        onChangePage: onChangePreviewPage,
      }}
      toolbarVisibility={{
        showColumnSelector: true,
        showStyleSelector: false,
        showSortSelector: false,
        showFullScreenSelector: false,
      }}
    />
  ) : (
    <PreviewEmptyPrompt />
  );
}
