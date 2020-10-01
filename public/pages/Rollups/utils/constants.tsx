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
import { SortDirection } from "../../../utils/constants";
import { renderTime } from "../../Policies/utils/helpers";
import { RollupItem } from "../models/interfaces";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: "",
  sortField: "name",
  sortDirection: SortDirection.DESC,
};

export const rollupsColumns: EuiTableFieldDataColumnType<RollupItem>[] = [
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

// export const SampleGetRollupJobs = [
//       {
//         "config": {
//           "id": "sensor2",
//           "index_pattern": "sensor-*",
//           "rollup_index": "sensor_rollup",
//           "cron": "*/30 * * * * ?",
//           "groups": {
//             "date_histogram": {
//               "fixed_interval": "1h",
//               "delay": "7d",
//               "field": "timestamp",
//               "time_zone": "UTC"
//             },
//             "terms": {
//               "fields": [
//                 "node"
//               ]
//             }
//           },
//           "metrics": [
//             {
//               "field": "temperature",
//               "metrics": [
//                 "min",
//                 "max",
//                 "sum"
//               ]
//             },
//             {
//               "field": "voltage",
//               "metrics": [
//                 "avg"
//               ]
//             }
//           ],
//           "timeout": "20s",
//           "page_size": 1000
//         },
//         "status": {
//           "job_state": "stopped",
//           "upgraded_doc_id": true
//         },
//         "stats": {
//           "pages_processed": 0,
//           "documents_processed": 0,
//           "rollups_indexed": 0,
//           "trigger_count": 0,
//           "index_failures": 0,
//           "index_time_in_ms": 0,
//           "index_total": 0,
//           "search_failures": 0,
//           "search_time_in_ms": 0,
//           "search_total": 0,
//           "processing_time_in_ms": 0,
//           "processing_total": 0
//         }
//       },
//       {
//         "config": {
//           "id": "sensor",
//           "index_pattern": "sensor-*",
//           "rollup_index": "sensor_rollup",
//           "cron": "*/30 * * * * ?",
//           "groups": {
//             "date_histogram": {
//               "fixed_interval": "1h",
//               "delay": "7d",
//               "field": "timestamp",
//               "time_zone": "UTC"
//             },
//             "terms": {
//               "fields": [
//                 "node"
//               ]
//             }
//           },
//           "metrics": [
//             {
//               "field": "temperature",
//               "metrics": [
//                 "min",
//                 "max",
//                 "sum"
//               ]
//             },
//             {
//               "field": "voltage",
//               "metrics": [
//                 "avg"
//               ]
//             }
//           ],
//           "timeout": "20s",
//           "page_size": 1000
//         },
//         "status": {
//           "job_state": "stopped",
//           "upgraded_doc_id": true
//         },
//         "stats": {
//           "pages_processed": 0,
//           "documents_processed": 0,
//           "rollups_indexed": 0,
//           "trigger_count": 0,
//           "index_failures": 0,
//           "index_time_in_ms": 0,
//           "index_total": 0,
//           "search_failures": 0,
//           "search_time_in_ms": 0,
//           "search_total": 0,
//           "processing_time_in_ms": 0,
//           "pro cessing_total": 0
//         }
//       }
//     ];
