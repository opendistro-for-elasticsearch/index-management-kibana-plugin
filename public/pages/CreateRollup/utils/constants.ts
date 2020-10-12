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
    delay: {},
    description: "",
    dimensions: [
      {
        date_histogram: {
          source_field: "",
          fixed_interval: "2ms",
          timezone: "America/Los_Angeles",
        },
      },
    ],
    enabled: false,
    enabled_time: {},
    last_updated_time: {},
    metadata_id: {},
    metrics: [],
    page_size: 1000,
    roles: [],
    schedule: {
      interval: {
        start_time: {},
        period: {},
        unit: "MINUTES",
      },
      cron: {},
    },
    schema_version: {},
    source_index: "",
    target_index: "",
  },
});

export const DEFAULT_ROLLUP = JSON.stringify({
  rollup: {
    source_index: "kibana_sample_data_flights",
    target_index: "new-index",
    schedule: {
      interval: {
        start_time: 1553112384,
        period: 1,
        unit: "Days",
      },
    },
    delay: 10,
    description: "newwwwww description!!!",
    enabled: false,
    last_updated_time: 1553112384,
    page_size: 200,
    dimensions: [
      {
        date_histogram: {
          source_field: "timestamp",
          fixed_interval: "30d",
          timezone: "America/Los_Angeles",
        },
      },
    ],
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

export const CalenderTimeunitOptions = [
  { value: "MINUTES", text: "Minute(s)" },
  { value: "HOURS", text: "Hour(s)" },
  { value: "DAYS", text: "Day(s)" },
];

export const TimezoneOptions = [
  { value: "12", text: "UTC +12" },
  { value: "11", text: "UTC +11" },
  { value: "10", text: "UTC +10" },
  { value: "9", text: "UTC +9" },
  { value: "8", text: "UTC +8" },
  { value: "7", text: "UTC +7" },
  { value: "6", text: "UTC +6" },
  { value: "5", text: "UTC +5" },
  { value: "4", text: "UTC +4" },
  { value: "3", text: "UTC +3" },
  { value: "2", text: "UTC +2" },
  { value: "1", text: "UTC +1" },
  { value: "0", text: "UTC +0" },
  { value: "-1", text: "UTC -1" },
  { value: "-2", text: "UTC -2" },
  { value: "-3", text: "UTC -3" },
  { value: "-4", text: "UTC -4" },
  { value: "-5", text: "UTC -5" },
  { value: "-6", text: "UTC -6" },
  { value: "-7", text: "UTC -7" },
  { value: "-8", text: "UTC -8" },
  { value: "-9", text: "UTC -9" },
  { value: "-10", text: "UTC -10" },
  { value: "-11", text: "UTC -11" },
  { value: "-12", text: "UTC -12" },
];
