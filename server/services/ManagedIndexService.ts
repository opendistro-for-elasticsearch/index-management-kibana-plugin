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

import _ from "lodash";
import { RequestParams } from "@elastic/elasticsearch";
import { RequestHandlerContext, KibanaRequest, KibanaResponseFactory, IKibanaResponse, IClusterClient } from "kibana/server";
import { INDEX } from "../utils/constants";
import { getMustQuery, transformManagedIndexMetaData } from "../utils/helpers";
import {
  ChangePolicyResponse,
  ExplainAllResponse,
  ExplainAPIManagedIndexMetaData,
  ExplainResponse,
  GetManagedIndicesResponse,
  RemovePolicyResponse,
  RemoveResponse,
  RetryManagedIndexResponse,
  RetryParams,
  RetryResponse,
  SearchResponse,
} from "../models/interfaces";
import { ManagedIndicesSort, ServerResponse } from "../models/types";
import { ManagedIndexItem } from "../../models/interfaces";

export default class ManagedIndexService {
  esDriver: IClusterClient;

  constructor(esDriver: IClusterClient) {
    this.esDriver = esDriver;
  }

  // TODO: Not finished, need UI page that uses this first
  getManagedIndex = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<any>>> => {
    try {
      const { id } = request.params as { id: string };
      const params: RequestParams.Get = { id, index: INDEX.OPENDISTRO_ISM_CONFIG };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const results: SearchResponse<any> = await callWithRequest("search", params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: results,
        },
      });
    } catch (err) {
      console.error("Index Management - ManagedIndexService - getManagedIndex:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  getManagedIndices = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<GetManagedIndicesResponse>>> => {
    try {
      const { from, size, search, sortDirection, sortField } = request.query as {
        from: string;
        size: string;
        search: string;
        sortDirection: string;
        sortField: string;
      };

      const managedIndexSorts: ManagedIndicesSort = { index: "managed_index.index", policyId: "managed_index.policy_id" };
      const explainParams = {
        size,
        from,
        sortField: sortField ? managedIndexSorts[sortField] : null,
        sortOrder: sortDirection,
        queryString: search ? `*${search.split(" ").join("* *")}*` : null,
      };

      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const explainAllResponse: ExplainAllResponse = await callWithRequest("ism.explainAll", explainParams);

      const managedIndices: ManagedIndexItem[] = [];
      for (const indexName in explainAllResponse) {
        if (indexName == "total_managed_indices") continue;
        const metadata = explainAllResponse[indexName] as ExplainAPIManagedIndexMetaData;
        let policy, seqNo, primaryTerm;
        const getResponse = await callWithRequest("ism.getPolicy", { policyId: metadata.policy_id });
        policy = _.get(getResponse, "policy", null);
        seqNo = _.get(getResponse, "_seq_no");
        primaryTerm = _.get(getResponse, "_primary_term");
        managedIndices.push({
          index: metadata.index,
          indexUuid: metadata.index_uuid,
          policyId: metadata.policy_id,
          policySeqNo: seqNo,
          policyPrimaryTerm: primaryTerm,
          policy: policy,
          enabled: metadata.enabled,
          managedIndexMetaData: transformManagedIndexMetaData(metadata),
        });
      }

      const totalManagedIndices: number = explainAllResponse.total_managed_indices;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: { managedIndices: managedIndices, totalManagedIndices: totalManagedIndices },
        },
      });
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { managedIndices: [], totalManagedIndices: 0 },
          },
        });
      }
      console.error("Index Management - ManagedIndexService - getManagedIndices", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  retryManagedIndexPolicy = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<RetryManagedIndexResponse>>> => {
    try {
      const { index, state = null } = request.body as { index: string[]; state?: string };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const params: RetryParams = { index: index.join(",") };
      if (state) params.body = { state };
      const retryResponse: RetryResponse = await callWithRequest("ism.retry", params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            failures: retryResponse.failures,
            updatedIndices: retryResponse.updated_indices,
            // TODO: remove ternary after fixing retry API to return empty array even if no failures
            failedIndices: retryResponse.failed_indices
              ? retryResponse.failed_indices.map((failedIndex) => ({
                  indexName: failedIndex.index_name,
                  indexUuid: failedIndex.index_uuid,
                  reason: failedIndex.reason,
                }))
              : [],
          },
        },
      });
    } catch (err) {
      console.error("Index Management - ManagedIndexService - retryManagedIndexPolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  changePolicy = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<ChangePolicyResponse>>> => {
    try {
      const { indices, policyId, include, state } = request.body as {
        indices: string[];
        policyId: string;
        state: string | null;
        include: { state: string }[];
      };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const params = { index: indices.join(","), body: { policy_id: policyId, include, state } };
      const changeResponse: RemoveResponse = await callWithRequest("ism.change", params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            failures: changeResponse.failures,
            updatedIndices: changeResponse.updated_indices,
            failedIndices: changeResponse.failed_indices.map((failedIndex) => ({
              indexName: failedIndex.index_name,
              indexUuid: failedIndex.index_uuid,
              reason: failedIndex.reason,
            })),
          },
        },
      });
    } catch (err) {
      console.error("Index Management - ManagedIndexService - changePolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  removePolicy = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<RemovePolicyResponse>>> => {
    try {
      const { indices } = request.body as { indices: string[] };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const params = { index: indices.join(",") };
      const addResponse: RemoveResponse = await callWithRequest("ism.remove", params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            failures: addResponse.failures,
            updatedIndices: addResponse.updated_indices,
            failedIndices: addResponse.failed_indices.map((failedIndex) => ({
              indexName: failedIndex.index_name,
              indexUuid: failedIndex.index_uuid,
              reason: failedIndex.reason,
            })),
          },
        },
      });
    } catch (err) {
      console.error("Index Management - ManagedIndexService - removePolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };
}
