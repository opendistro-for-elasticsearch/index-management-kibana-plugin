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
      description: "A simple default policy that changes the replica count between hot and cold states.",
      default_state: "hot",
      states: [
        {
          name: "hot",
          actions: [{ replica_count: { number_of_replicas: 5 } }],
          transitions: [{ state_name: "cold", conditions: { min_index_age: "30d" } }],
        },
        {
          name: "cold",
          actions: [{ replica_count: { number_of_replicas: 2 } }],
          transitions: [],
        },
      ],
    },
  },
  null,
  4
);
