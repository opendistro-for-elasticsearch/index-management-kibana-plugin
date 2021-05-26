/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

export const EMPTY_ROLLUP = JSON.stringify({
  rollup: {
    continuous: false,
    description: "",
    dimensions: [
      {
        date_histogram: {
          source_field: "",
          fixed_interval: "1h",
          timezone: "UTC",
        },
      },
    ],
    enabled: true,
    metrics: [],
    page_size: 1000,
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

export const FixedTimeunitOptions = [
  { value: "ms", text: "Millisecond(s)" },
  { value: "s", text: "Second(s)" },
  { value: "m", text: "Minute(s)" },
  { value: "h", text: "Hour(s)" },
  { value: "d", text: "Day(s)" },
];

export const DelayTimeunitOptions = [
  { value: "SECONDS", text: "Second(s)" },
  { value: "MINUTES", text: "Minute(s)" },
  { value: "HOURS", text: "Hour(s)" },
  { value: "DAYS", text: "Day(s)" },
];

export const CalendarTimeunitOptions = [
  { value: "m", text: "Minute" },
  { value: "h", text: "Hour" },
  { value: "d", text: "Day" },
  { value: "w", text: "Week" },
  { value: "M", text: "Month" },
  { value: "q", text: "Quarter" },
  { value: "y", text: "Year" },
];

export const ScheduleIntervalTimeunitOptions = [
  { value: "MINUTES", text: "Minute(s)" },
  { value: "HOURS", text: "Hour(s)" },
  { value: "DAYS", text: "Day(s)" },
];

export const AddFieldsColumns = [
  {
    field: "label",
    name: "Field name",
    sortable: true,
  },
  {
    field: "type",
    name: "Field type",
    sortable: true,
    render: (type: string | undefined) => (type == null || type == undefined ? "-" : type),
  },
];

export const WHERE_BOOLEAN_FILTERS = [
  { text: "Select value", value: "" },
  { text: "True", value: true },
  { text: "False", value: false },
];

export const OPERATORS_MAP = {
  IS: "is",
  IS_NOT: "is_not",
  IS_NULL: "is_null",
  IS_NOT_NULL: "is_not_null",
  IS_GREATER: "is_greater",
  IS_GREATER_EQUAL: "is_greater_equal",
  IS_LESS: "is_less",
  IS_LESS_EQUAL: "is_less_equal",
  STARTS_WITH: "starts_with",
  ENDS_WITH: "ends_with",
  CONTAINS: "contains",
  NOT_CONTAINS: "does_not_contains",
  IN_RANGE: "in_range",
  NOT_IN_RANGE: "not_in_range",
};

export const COMPARISON_OPERATORS = [
  { text: "is", value: OPERATORS_MAP.IS, dataTypes: ["number", "text", "keyword", "boolean"] },
  {
    text: "is not",
    value: OPERATORS_MAP.IS_NOT,
    dataTypes: ["number", "text", "keyword", "boolean"],
  },
  {
    text: "is null",
    value: OPERATORS_MAP.IS_NULL,
    dataTypes: ["number", "text", "keyword", "boolean"],
  },
  {
    text: "is not null",
    value: OPERATORS_MAP.IS_NOT_NULL,
    dataTypes: ["number", "text", "keyword"],
  },
  { text: "is greater than", value: OPERATORS_MAP.IS_GREATER, dataTypes: ["number"] },
  { text: "is greater than equal", value: OPERATORS_MAP.IS_GREATER_EQUAL, dataTypes: ["number"] },
  { text: "is less than", value: OPERATORS_MAP.IS_LESS, dataTypes: ["number"] },
  { text: "is less than equal", value: OPERATORS_MAP.IS_LESS_EQUAL, dataTypes: ["number"] },
  { text: "is in range", value: OPERATORS_MAP.IN_RANGE, dataTypes: ["number"] },
  { text: "is not in range", value: OPERATORS_MAP.NOT_IN_RANGE, dataTypes: ["number"] },
  { text: "starts with", value: OPERATORS_MAP.STARTS_WITH, dataTypes: ["text", "keyword"] },
  { text: "ends with", value: OPERATORS_MAP.ENDS_WITH, dataTypes: ["text", "keyword"] },
  { text: "contains", value: OPERATORS_MAP.CONTAINS, dataTypes: ["text", "keyword"] },
  { text: "does not contains", value: OPERATORS_MAP.NOT_CONTAINS, dataTypes: ["text"] },
];
