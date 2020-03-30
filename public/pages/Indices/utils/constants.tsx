/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { EuiHealth, EuiTableFieldDataColumnType } from "@elastic/eui";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import { SortDirection } from "../../../utils/constants";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: "",
  sortField: "name",
  sortDirection: SortDirection.DESC,
};

const HEALTH_TO_COLOR: {
  [health: string]: string;
  green: string;
  yellow: string;
  red: string;
} = {
  green: "success",
  yellow: "warning",
  red: "danger",
};

export const indicesColumns: EuiTableFieldDataColumnType<ManagedCatIndex>[] = [
  {
    field: "index",
    name: "Index",
    sortable: true,
    truncateText: true,
    textOnly: true,
    width: "250px",
    render: (index: string) => <span title={index}>{index}</span>,
  },
  {
    field: "health",
    name: "Health",
    sortable: true,
    truncateText: true,
    textOnly: true,
    align: "right",
    render: (health: string, item: ManagedCatIndex) => {
      const color = health ? HEALTH_TO_COLOR[health] : "subdued";
      const text = health || item.status;
      return <EuiHealth color={color}>{text}</EuiHealth>;
    },
  },
  {
    field: "managed",
    name: "Managed by Policy",
    sortable: false,
    truncateText: true,
    textOnly: true,
    align: "right",
    width: "150px",
  },
  {
    field: "status",
    name: "Status",
    sortable: true,
    truncateText: true,
    textOnly: true,
    align: "right",
  },
  {
    field: "store.size",
    name: "Total size",
    sortable: true,
    truncateText: true,
    textOnly: true,
    dataType: "number",
  },
  {
    field: "pri.store.size",
    name: "Primaries size",
    sortable: true,
    truncateText: true,
    textOnly: true,
    dataType: "number",
  },
  {
    field: "docs.count",
    name: "Total documents",
    sortable: true,
    truncateText: true,
    textOnly: true,
    dataType: "number",
    render: (count: string) => <span title={count}>{count}</span>,
  },
  {
    field: "docs.deleted",
    name: "Deleted documents",
    sortable: true,
    truncateText: true,
    textOnly: true,
    dataType: "number",
    render: (deleted: string) => <span title={deleted}>{deleted}</span>,
  },
  {
    field: "pri",
    name: "Primaries",
    sortable: true,
    truncateText: true,
    textOnly: true,
    dataType: "number",
  },
  {
    field: "rep",
    name: "Replicas",
    sortable: true,
    truncateText: true,
    textOnly: true,
    dataType: "number",
  },
];
