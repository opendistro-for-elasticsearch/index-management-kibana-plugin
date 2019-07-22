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

import { IndexService, ManagedIndexService, PolicyService } from "../services";
import { DocumentPolicy, ManagedIndexItem } from "../../models/interfaces";

export interface NodeServices {
  indexService: IndexService;
  managedIndexService: ManagedIndexService;
  policyService: PolicyService;
}

export interface SearchResponse<T> {
  hits: {
    total: { value: number };
    hits: { _source: T; _id: string; _seq_no?: number; _primary_term?: number }[];
  };
}

export interface ExplainResponse {
  [index: string]: ExplainAPIManagedIndexMetaData | undefined;
}

export interface ServerResponse<T> {
  response?: T;
  error?: string;
}

export interface GetManagedIndicesResponse {
  totalManagedIndices: number;
  managedIndices: ManagedIndexItem[];
}

export interface GetPoliciesResponse {
  policies: DocumentPolicy[];
  totalPolicies: number;
}

export interface DeletePolicyResponse {
  result: string;
}

export interface PutPolicyResponse {
  _id: string;
  // TODO: remove _version from IndexPolicyAPI
  _version: number;
  _primary_term: number;
  _seq_no: number;
  policy: { policy: object };
}

export interface GetPolicyResponse extends DocumentPolicy {}

export interface GetIndicesResponse {
  indices: CatIndex[];
  totalIndices: number;
}

export interface AddPolicyResponse {
  updatedIndices: number;
  failures: boolean;
  failedIndices: string[];
}

export interface RetryParams {
  index: string;
  body?: { state: string };
}

export interface DeletePolicyParams {
  policyId: string;
}

export interface PutPolicyParams {
  policyId: string;
  ifSeqNo?: string;
  ifPrimaryTerm?: string;
  body: string;
}

// TODO: remove optional failedIndices after fixing retry API to always array
export interface RetryResponse {
  failures: boolean;
  updated_indices: number;
  failed_indices?: BackendFailedIndex[];
}

export interface BackendFailedIndex {
  index_name: string;
  index_uuid: string;
  reason: string;
}
export interface FailedIndex {
  indexName: string;
  indexUuid: string;
  reason: string;
}

export interface RetryManagedIndexResponse {
  failures: boolean;
  updatedIndices: number;
  failedIndices: FailedIndex[];
}

// TODO: rename policy_name to policy_id after backend PR is merged
export interface ExplainAPIManagedIndexMetaData {
  "opendistro.index_state_management.policy_name": string | null;
  index?: string;
  index_uuid?: string;
  policy_name?: string;
  policy_seq_no?: number;
  policy_primary_term?: number;
  policy_completed?: boolean;
  rolled_over?: boolean;
  transition_to?: string;
  state?: string;
  state_start_time?: number;
  action?: string;
  action_index?: number;
  action_start_time?: number;
  consumed_retries?: number;
  failed?: boolean;
  info?: object;
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

export interface QueryStringQuery<T extends string> {
  query_string: {
    default_field: T;
    default_operator: "AND";
    query: string;
  };
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
