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

import { IndexService, ManagedIndexService, PolicyService, RollupService, TransformService } from "../services";
import { DocumentPolicy, DocumentRollup, DocumentTransform, ManagedIndexItem, Rollup, Transform } from "../../models/interfaces";

export interface NodeServices {
  indexService: IndexService;
  managedIndexService: ManagedIndexService;
  policyService: PolicyService;
  rollupService: RollupService;
  transformService: TransformService;
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

export interface ExplainAllResponse {
  [index: string]: ExplainAPIManagedIndexMetaData | number;
  total_managed_indices: number;
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

export interface DeleteRollupResponse {
  result: string;
}

export interface GetIndicesResponse {
  indices: ManagedCatIndex[];
  totalIndices: number;
}

export interface GetFieldsResponse {
  result: string;
}

export interface GetRollupsResponse {
  rollups: DocumentRollup[];
  totalRollups: number;
  metadata: any;
}

export interface PutRollupResponse {
  _id: string;
  _primary_term: number;
  _seq_no: number;
  rollup: { rollup: Rollup };
}

export interface DeleteTransformResponse {
  result: string;
}

export interface GetTransformsResponse {
  transforms: DocumentTransform[];
  totalTransforms: number;
  metadata: any;
}

export interface PutTransformResponse {
  _id: string;
  _primary_term: string;
  _seq_no: string;
  transform: { transform: Transform };
}

export interface PreviewTransformResponse {
  documents: object[];
}

export interface IndexUpdateResponse {
  updatedIndices: number;
  failures: boolean;
  failedIndices: FailedIndex[];
}

export interface ApplyPolicyResponse extends IndexUpdateResponse {}

export interface RemovePolicyResponse extends IndexUpdateResponse {}

export interface ChangePolicyResponse extends IndexUpdateResponse {}

export interface RetryManagedIndexResponse extends IndexUpdateResponse {}

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
export interface DeleteRollupParams {
  rollupId: string;
}

export interface PutRollupParams {
  rollupId: string;
  if_seq_no?: string;
  if_primary_term?: string;
  body: string;
}

export interface DeleteRollupParams {
  rollupId: string;
}

export interface PutRollupParams {
  rollupId: string;
  if_seq_no?: string;
  if_primary_term?: string;
  body: string;
}

export interface PutTransformParams {
  transformId: string;
  if_seq_no?: string;
  if_primary_term?: string;
  body: string;
}

export interface DeleteTransformParams {
  transformId: string;
}

// TODO: remove optional failedIndices after fixing retry API to always array
export interface RetryResponse {
  failures: boolean;
  updated_indices: number;
  failed_indices?: BackendFailedIndex[];
}

export interface AddResponse {
  failures: boolean;
  updated_indices: number;
  failed_indices: BackendFailedIndex[];
}

export interface RemoveResponse {
  failures: boolean;
  updated_indices: number;
  failed_indices: BackendFailedIndex[];
}

export interface AcknowledgedResponse {
  acknowledged: boolean;
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

export interface ExplainAPIManagedIndexMetaData {
  "index.opendistro.index_state_management.policy_id": string | null;
  index: string;
  index_uuid: string;
  policy_id: string;
  policy_seq_no?: number;
  policy_primary_term?: number;
  policy_completed?: boolean;
  rolled_over?: boolean;
  transition_to?: string;
  state?: { name: string; start_time: number };
  action?: { name: string; start_time: number; index: number; failed: boolean; consumed_retries: number };
  retry_info?: { failed: boolean; consumed_retries: number };
  info?: object;
  enabled: boolean;
}

export interface SearchSampleDataResponse {
  total: number;
  data: {
    _index: string;
    _type: string;
    _id: string;
    _score: number;
    _source: object;
  }[];
}

export interface IndexManagementApi {
  [API_ROUTE: string]: string;

  readonly POLICY_BASE: string;
  readonly EXPLAIN_BASE: string;
  readonly RETRY_BASE: string;
  readonly ADD_POLICY_BASE: string;
  readonly REMOVE_POLICY_BASE: string;
  readonly CHANGE_POLICY_BASE: string;
  readonly ROLLUP_JOBS_BASE: string;
  readonly TRANSFORM_BASE: string;
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

export interface ManagedCatIndex extends CatIndex {
  managed: string;
}
