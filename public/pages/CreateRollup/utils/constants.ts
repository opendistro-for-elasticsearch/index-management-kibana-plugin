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

//Added last_updated_time and start_time to avoid error, but they should be system generated.
//Added a delay as 0, but this should be optional, so null should be fine.
export const EMPTY_ROLLUP = JSON.stringify({
  rollup: {
    continuous: false,
    description: "",
    dimensions: [
      {
        date_histogram: {
          source_field: "",
          fixed_interval: "2ms",
          timezone: "Africa/Abidjan",
        },
      },
    ],
    enabled: false,
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
