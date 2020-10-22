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

import { Direction } from "@elastic/eui";
import { Rollup } from "../../../../models/interfaces";

export interface RollupItem {
  _id: string;
  _version: number;
  _seq_no: number;
  _primary_term: number;
  rollup: Rollup; // only dumped to view as JSON as of now, don't need to type
}

export interface RollupQueryParams {
  from: number;
  size: number;
  search: string;
  sortField: keyof RollupItem;
  sortDirection: Direction;
}
