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

import { SortDirection } from "../../../utils/constants";

// TODO: Consolidate with Rollup
export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: "",
  sortField: "_id",
  sortDirection: SortDirection.DESC,
};

export const EMPTY_TRANSFORM = JSON.stringify({
  transform: {
    description: "",
    groups: [],
    enabled: true,
    aggregations: {},
    data_selection_query: {},
    roles: [],
    schedule: {
      interval: {
        start_time: 234802,
        period: 1,
        unit: "MINUTES",
      },
    },
    source_index: "",
    target_index: "",
  },
});

export const ScheduleIntervalTimeunitOptions = [
  { value: "MINUTES", text: "Minute(s)" },
  { value: "HOURS", text: "Hour(s)" },
  { value: "DAYS", text: "Day(s)" },
];
