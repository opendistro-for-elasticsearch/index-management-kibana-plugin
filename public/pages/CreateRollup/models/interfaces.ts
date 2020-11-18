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

import { FieldItem } from "../../../../models/interfaces";

export interface DimensionItem {
  sequence: number;
  field: FieldItem;
  aggregationMethod: string;
  interval?: number;
}

//From backend
export interface RollupDimensionItem {
  date_histogram: {
    fixed_interval?: string;
    calendar_interval?: string;
    source_field: string;
    target_field: string;
    timezone: string;
  };
  terms?: {
    source_field: string;
    target_field: string;
  };
  histogram?: {
    source_field: string;
    target_field: string;
    interval: number;
  };
}

export interface RollupMetricItem {
  source_field: string;
  metrics: [
    {
      min?: Object;
      max?: Object;
      sum?: Object;
      avg?: Object;
      value_count?: Object;
    }
  ];
}
