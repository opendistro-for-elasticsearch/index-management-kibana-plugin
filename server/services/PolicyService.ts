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
import { IClusterClient, KibanaRequest, KibanaResponseFactory, IKibanaResponse, ResponseError, RequestHandlerContext } from "kibana/server";
import { INDEX } from "../utils/constants";
import {
  DeletePolicyParams,
  DeletePolicyResponse,
  GetPoliciesResponse,
  PutPolicyParams,
  PutPolicyResponse,
  SearchResponse,
} from "../models/interfaces";
import { getMustQuery } from "../utils/helpers";
import { PoliciesSort, ServerResponse } from "../models/types";
import { DocumentPolicy, Policy } from "../../models/interfaces";

export default class PolicyService {
  esDriver: IClusterClient;

  constructor(esDriver: IClusterClient) {
    this.esDriver = esDriver;
  }

  /**
   * Calls backend Put Policy API
   */
  putPolicy = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<PutPolicyResponse> | ResponseError>> => {
    try {
      const { id } = request.params as { id: string };
      const { seqNo, primaryTerm } = request.query as { seqNo?: string; primaryTerm?: string };
      let method = "ism.putPolicy";
      let params: PutPolicyParams = { policyId: id, ifSeqNo: seqNo, ifPrimaryTerm: primaryTerm, body: JSON.stringify(request.body) };
      if (seqNo === undefined || primaryTerm === undefined) {
        method = "ism.createPolicy";
        params = { policyId: id, body: JSON.stringify(request.body) };
      }
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const putPolicyResponse: PutPolicyResponse = await callWithRequest(method, params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: putPolicyResponse,
        },
      });
    } catch (err) {
      console.error("Index Management - PolicyService - putPolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  /**
   * Calls backend Delete Policy API
   */
  deletePolicy = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<boolean> | ResponseError>> => {
    try {
      const { id } = request.params as { id: string };
      const params: DeletePolicyParams = { policyId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const deletePolicyResponse: DeletePolicyResponse = await callWithRequest("ism.deletePolicy", params);
      if (deletePolicyResponse.result !== "deleted") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: deletePolicyResponse.result,
          },
        });
      }
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: true,
        },
      });
    } catch (err) {
      console.error("Index Management - PolicyService - deletePolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  /**
   * Calls backend Get Policy API
   */
  getPolicy = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<DocumentPolicy>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { policyId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const getResponse = await callWithRequest("ism.getPolicy", params);
      const policy = _.get(getResponse, "policy", null);
      const seqNo = _.get(getResponse, "_seq_no");
      const primaryTerm = _.get(getResponse, "_primary_term");
      if (policy) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { id, seqNo: seqNo as number, primaryTerm: primaryTerm as number, policy: policy as Policy },
          },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: "Failed to load policy",
          },
        });
      }
    } catch (err) {
      console.error("Index Management - PolicyService - getPolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  /**
   * Calls backend Get Policy API
   */
  getPolicies = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<GetPoliciesResponse>>> => {
    try {
      const { from = 0, size = 20, search, sortDirection = "desc", sortField = "id" } = request.query as {
        from: number;
        size: string;
        search: string;
        sortDirection: string;
        sortField: string;
      };

      const policySorts: PoliciesSort = {
        id: "policy.policy_id.keyword",
        "policy.policy.description": "policy.description.keyword",
        "policy.policy.last_updated_time": "policy.last_updated_time",
      };

      const str = search.trim();
      const params = {
        size,
        from,
        sortOrder: sortDirection,
        sortField: policySorts[sortField],
        queryString: str ? `*${str.split(" ").join("* *")}*` : "*",
      };

      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const getResponse = await callWithRequest("ism.getPolicies", params);

      const policies: DocumentPolicy[] = getResponse.policies.map((p) => ({
        seqNo: p._seq_no,
        primaryTerm: p._primary_term,
        id: p._id,
        policy: { policy: p.policy },
      }));

      const totalPolicies: number = getResponse.totalPolicies;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: { policies: policies, totalPolicies },
        },
      });
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { policies: [], totalPolicies: 0 },
          },
        });
      }
      console.error("Index Management - PolicyService - getPolicies", err);
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
