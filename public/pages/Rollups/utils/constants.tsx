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
import { EuiTableFieldDataColumnType } from "@elastic/eui";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import { SortDirection } from "../../../utils/constants";
import { renderTime } from "../../Policies/utils/helpers";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: "",
  sortField: "name",
  sortDirection: SortDirection.DESC,
};

export const rollupsColumns: EuiTableFieldDataColumnType<ManagedCatIndex>[] = [
  {
    field: "name",
    name: "Name",
    sortable: true,
    textOnly: true,
  },
  {
    field: "source_index",
    name: "Source index",
    sortable: true,
    textOnly: true,
    align: "right",
  },
  {
    field: "target_index",
    name: "Target index",
    sortable: true,
    textOnly: true,
  },
  {
    field: "enabled",
    name: "Job state",
    sortable: true,
    textOnly: true,
  },
  {
    field: "currentWindow",
    name: "Current rollup window",
    sortable: true,
    textOnly: true,
  },
  {
    field: "status",
    name: "Status",
    sortable: true,
    textOnly: true,
  },
  {
    field: "recurring",
    name: "Recurring",
    sortable: true,
    textOnly: true,
  },
  {
    field: "master_timeout",
    name: "Next execution",
    sortable: true,
    textOnly: true,
    render: renderTime,
    dataType: "date",
  },
];
