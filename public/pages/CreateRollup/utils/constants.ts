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

export const DEFAULT_ROLLUP = JSON.stringify(
  {
    rollup: {
      source_index: "logstash-1", // or "log*" or "some-alias" or "logstash-*, something"
      target_index: "rollup-logstash",
      page_size: 100,
      delay: "10m",
      schedule: {
        interval: {
          start_time: 1553112384,
          period: 1,
          unit: "Hours",
        },
      },
      roles: ["super_role", "ops"],
      run_as_user: "drew",
      description: "Rolls up our daily logstash indices into monthly summarized views",
      last_updated_time: 1553112384,
      error_notification: {
        destination: { slack: { url: "..." } },
      },
      message_template: { source: "..." },
    },
    // fill in dimensions/metrics
  },
  null,
  4
);
