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

export const DEFAULT_POLICY = JSON.stringify(
  {
    policy: {
      description: "Default policy",
      default_state: "Ingest",
      states: [
        {
          name: "Ingest",
          actions: [{ rollover: { min_doc_count: 10000000 } }],
          transitions: [{ state_name: "Search" }],
        },
        {
          name: "Search",
          actions: [],
          transitions: [
            {
              state_name: "Delete",
              conditions: { min_index_age: "30d" },
            },
          ],
        },
        {
          name: "Delete",
          actions: [{ delete: {} }],
          transitions: [],
        },
      ],
    },
  },
  null,
  4
);
