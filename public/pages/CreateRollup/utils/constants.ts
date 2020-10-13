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

//Removed delay for now to see if acceptable
export const EMPTY_ROLLUP = JSON.stringify({
  rollup: {
    continuous: false,
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

export const TimezoneOptionsByRegion = [
  { text: "UTC +9:30 / +10:30 - Australia/Darwin", value: "Australia/Darwin" },
  { text: "UTC +10:00 / +11:00 - Australia/Sydney", value: "Australia/Sydney" },
  { text: "UTC -3 - America/Argentina/Buenos Aires", value: "America/Argentina/Buenos_Aires" },
  { text: "UTC +2 - Africa/Cairo", value: "Africa/Cairo" },
  { text: "UTC -8 / -9 - America/Anchorage", value: "America/Anchorage" },
  { text: "UTC -3 - America/Sao Paulo", value: "America/Sao_Paulo" },
  { text: "UTC +6 - Asia/Dhaka", value: "Asia/Dhaka" },
  { text: "UTC +2 - Africa/Harare", value: "Africa/Harare" },
  { text: "UTC -2:30 / -3:30 - America/St Johns", value: "America/St_Johns" },
  { text: "UTC -5/ -6 - America/Chicago", value: "America/Chicago" },
  { text: "UTC +8 - Asia/Shanghai", value: "Asia/Shanghai" },
  { text: "UTC +3 - Africa/Addis Ababa", value: "Africa/Addis_Ababa" },
  { text: "UTC +1 / +2 - Europe/Paris", value: "Europe/Paris" },
  { text: "UTC -4 /-5 - America/Indiana/Indianapolis", value: "America/Indiana/Indianapolis" },
  { text: "UTC +5:30 - Asia/Kolkata", value: "Asia/Kolkata" },
  { text: "UTC +9 - Asia/Tokyo", value: "Asia/Tokyo" },
  { text: "UTC +13 / +14 - Pacific/Apia", value: "Pacific/Apia" },
  { text: "UTC +4 Asia/Yerevan", value: "Asia/Yerevan" },
  { text: "UTC +12 / +13 - Pacific/Auckland", value: "Pacific/Auckland" },
  { text: "UTC +5 - Asia/Karachi", value: "Asia/Karachi" },
  { text: "UTC -7 - America/Phoenix", value: "America/Phoenix" },
  { text: "UTC -4 - America/Puerto Rico", value: "America/Puerto_Rico" },
  { text: "UTC -7 / -8 - America/Los Angeles", value: "America/Los_Angeles" },
  { text: "UTC +11 - Pacific/Guadalcanal", value: "Pacific/Guadalcanal" },
  { text: "UTC +7 - Asia/Ho Chi Minh", value: "Asia/Ho_Chi_Minh" },
  { text: "UTC -5", value: "-05:00" },
  { text: "UTC -7", value: "-07:00" },
  { text: "UTC -10", value: "-10:00" },
];
