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
import { EuiLink, EuiTableFieldDataColumnType } from "@elastic/eui";
import { ROUTES, SortDirection } from "../../../utils/constants";
import { RollupItem } from "../models/interfaces";
import { renderContinuous, renderEnabled } from "./helpers";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: "",
  sortField: "name",
  sortDirection: SortDirection.DESC,
};

// export const rollupsColumns: EuiTableFieldDataColumnType<RollupItem>[] = [
//   {
//     field: "_id",
//     name: "Name",
//     sortable: true,
//     textOnly: true,
//     truncateText: true,
//     render: (_id) =>
//       <EuiLink href={"opendistro_index_management_kibana#/rollup-details?" + _id}>
//                {/*onClick={ () => this.props.history.push(`${ROUTES.ROLLUP_DETAILS}?id=${_id}`);}*/}
//                {_id}
//       </EuiLink>,
//   },
//   {
//     field: "rollup.source_index",
//     name: "Source index",
//     sortable: true,
//     textOnly: true,
//     truncateText: true,
//   },
//   {
//     field: "rollup.target_index",
//     name: "Target index",
//     sortable: true,
//     textOnly: true,
//     truncateText: true,
//   },
//   {
//     field: "rollup.enabled",
//     name: "Job state",
//     sortable: true,
//     textOnly: true,
//     truncateText: true,
//     render: renderEnabled,
//   },
//   {
//     field: "rollup.continuous",
//     name: "Continuous",
//     sortable: true,
//     textOnly: true,
//     truncateText: true,
//     render: renderContinuous,
//   },
//   {
//     field: "nextWindow",
//     name: "Next rollup window",
//     sortable: true,
//     textOnly: true,
//     truncateText: true,
//   },
//   {
//     field: "status",
//     name: "Job status",
//     sortable: true,
//     textOnly: true,
//   },
// ];
