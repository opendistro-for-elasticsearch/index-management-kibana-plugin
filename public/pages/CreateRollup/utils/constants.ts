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
export const testRollup = {
  _id: "test1",
  _version: 3,
  _seq_no: 7,
  _primary_term: 1,
  rollup: {
    rollup_id: "test1",
    enabled: true,
    schedule: {
      interval: {
        period: 1,
        unit: "Minutes",
        start_time: 1602100553,
      },
    },
    last_updated_time: 1602100553,
    description: "An example job that rolls up the sample ecommerce data",
    source_index: "kibana_sample_data_ecommerce",
    target_index: "test_rollup",
    page_size: 1000,
    delay: 0,
    continuous: false,
    metadata_id: null,
    enabledTime: null,
    lastUpdatedTime: null,
    schemaVersion: 1,
    dimensions: [
      {
        date_histogram: {
          source_field: "order_date",
          fixed_interval: "90m",
          timezone: "America/Los_Angeles",
        },
      },
      {
        terms: {
          source_field: "customer_gender",
        },
      },
      {
        terms: {
          source_field: "geoip.city_name",
        },
      },
      {
        terms: {
          source_field: "geoip.region_name",
        },
      },
      {
        terms: {
          source_field: "day_of_week",
        },
      },
    ],
    metrics: [
      {
        source_field: "taxless_total_price",
        metrics: [{ avg: {} }, { sum: {} }, { max: {} }, { min: {} }, { value_count: {} }],
      },
      {
        source_field: "total_quantity",
        metrics: [{ avg: {} }, { max: {} }],
      },
    ],
  },
};
export const testRollup2 = {
  _id: "test2",
  _version: 3,
  _seq_no: 7,
  _primary_term: 1,
  rollup: {
    rollup_id: "test2",
    enabled: false,
    schedule: {
      interval: {
        period: 1,
        unit: "Minutes",
        start_time: 1602100553,
      },
    },
    last_updated_time: 1602100553,
    description: "Another example job that rolls up the sample ecommerce data",
    source_index: "kibana_sample_data_ecommerce",
    target_index: "test_rollup2",
    page_size: 1000,
    delay: 0,
    continuous: false,
    dimensions: [
      {
        date_histogram: {
          source_field: "order_date",
          fixed_interval: "60m",
          timezone: "America/Los_Angeles",
        },
      },
      {
        terms: {
          source_field: "customer_gender",
        },
      },
      {
        terms: {
          source_field: "geoip.city_name",
        },
      },
      {
        terms: {
          source_field: "geoip.region_name",
        },
      },
      {
        terms: {
          source_field: "day_of_week",
        },
      },
      {
        terms: {
          source_field: "day_of_week_i",
        },
      },
    ],
    metrics: [
      {
        source_field: "taxless_total_price",
        metrics: [{ avg: {} }, { sum: {} }, { max: {} }, { min: {} }, { value_count: {} }],
      },
      {
        source_field: "total_quantity",
        metrics: [{ avg: {} }, { max: {} }],
      },
    ],
  },
};

export const test1Metadata = {
  test1: {
    metadata_id: "GSCm3HUBeGRB78cDQju6",
    rollup_metadata: {
      rollup_id: "test1",
      last_updated_time: 1605724690355,
      status: "finished",
      failure_reason: null,
      stats: {
        pages_processed: 5,
        documents_processed: 4675,
        rollups_indexed: 3627,
        index_time_in_millis: 1522,
        search_time_in_millis: 1168,
      },
    },
  },
};
export const test2Metadata = {
  test2: {
    metadata_id: "GSCm3HUBeGRB78cDQju6",
    rollup_metadata: {
      rollup_id: "test2",
      last_updated_time: 1605724690355,
      status: "finished",
      failure_reason: null,
      stats: {
        pages_processed: 5,
        documents_processed: 4675,
        rollups_indexed: 3627,
        index_time_in_millis: 1522,
        search_time_in_millis: 1168,
      },
    },
  },
};
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
