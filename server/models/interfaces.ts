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

export interface SearchResponse<T> {
  hits: {
    hits: { _source: T; _id: string; _seq_no?: number; _primary_term?: number }[];
  };
}

export interface ServerResponse<T> {
  response?: T;
  error?: string;
}

export interface GetIndicesResponse {
  indices: CatIndex[];
  totalIndices: number;
}

export interface IndexManagementApi {
  [API_ROUTE: string]: string;
  readonly POLICY_BASE: string;
  readonly EXPLAIN_BASE: string;
  readonly RETRY_BASE: string;
}

export interface DefaultHeaders {
  "Content-Type": "application/json";
  Accept: "application/json";
}

// Default _cat index response
export interface CatIndex {
  "docs.count": string;
  "docs.deleted": string;
  health: string;
  index: string;
  pri: string;
  "pri.store.size": string;
  rep: string;
  status: string;
  "store.size": string;
  uuid: string;
}
