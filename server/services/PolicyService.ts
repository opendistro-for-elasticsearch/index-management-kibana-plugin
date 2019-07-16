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

import _ from "lodash";
import { Legacy } from "kibana";
import { CLUSTER, INDEX } from "../utils/constants";
import {
  DeletePolicyParams,
  DeletePolicyResponse,
  GetPoliciesResponse,
  GetPolicyResponse,
  PutPolicyParams,
  PutPolicyResponse,
  SearchResponse,
  ServerResponse,
} from "../models/interfaces";
import { getMustQuery } from "../utils/helpers";
import { DEFAULT_QUERY_PARAMS } from "../../public/pages/Policies/utils/constants";
import { PoliciesSort } from "../models/types";

import Request = Legacy.Request;
import ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
import ResponseToolkit = Legacy.ResponseToolkit;

export default class PolicyService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  putPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<PutPolicyResponse>> => {
    try {
      const { id } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query as { ifSeqNo?: string; ifPrimaryTerm?: string };
      let method = "ism.putPolicy";
      let params: PutPolicyParams = { policyId: id, ifSeqNo: ifSeqNo, ifPrimaryTerm: ifPrimaryTerm, body: JSON.stringify(req.payload) };
      if (ifSeqNo === undefined || ifPrimaryTerm === undefined) {
        method = "ism.createPolicy";
        params = { policyId: id, body: JSON.stringify(req.payload) };
      }
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response = await callWithRequest(req, method, params);
      return { ok: true, resp: response };
    } catch (err) {
      console.error("Index Management - PolicyService - putPolicy:", err);
      return { ok: false, resp: err.message };
    }
  };

  deletePolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<null>> => {
    try {
      const { id } = req.params;
      const params: DeletePolicyParams = { policyId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response: DeletePolicyResponse = await callWithRequest(req, "ism.deletePolicy", params);
      if (response.result !== "deleted") {
        return { ok: false, resp: null, error: response.result };
      }
      return { ok: true, resp: null };
    } catch (err) {
      console.error("Index Management - PolicyService - deletePolicy:", err);
      return { ok: false, resp: null, error: err.message };
    }
  };

  getPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetPolicyResponse>> => {
    try {
      const { id } = req.params;
      const params = { policyId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const getResponse = await callWithRequest(req, "ism.getPolicy", params);
      const policy = _.get(getResponse, "policy", null);
      const seqNo = _.get(getResponse, "_seq_no", null);
      const primaryTerm = _.get(getResponse, "_primary_term", null);
      if (policy) {
        return { ok: true, resp: { id, seqNo, primaryTerm, policy } };
      } else {
        return { ok: false, resp: null, error: "Failed to load policy" };
      }
    } catch (err) {
      console.error("Index Management - PolicyService - getPolicy:", err);
      return { ok: false, resp: null, error: err.message };
    }
  };

  getPolicies = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetPoliciesResponse>> => {
    try {
      const {
        from = DEFAULT_QUERY_PARAMS.from,
        size = DEFAULT_QUERY_PARAMS.size,
        search = DEFAULT_QUERY_PARAMS.search,
        sortDirection = DEFAULT_QUERY_PARAMS.sortDirection,
        sortField = DEFAULT_QUERY_PARAMS.sortField,
      } = req.query as { from: string; size: string; search: string; sortDirection: string; sortField: string };

      const policySorts: PoliciesSort = { name: "policy.name.keyword" };
      const params = {
        index: INDEX.OPENDISTRO_ISM_CONFIG,
        seq_no_primary_term: true,
        body: {
          size,
          from,
          sort: policySorts[sortField] ? [{ [policySorts[sortField]]: sortDirection }] : [],
          query: {
            bool: {
              filter: [{ exists: { field: "policy" } }],
              // TODO change policy.name to id when it's available from backend fix
              must: getMustQuery("policy.name", search),
            },
          },
        },
      };

      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.DATA);
      const searchResponse: SearchResponse<any> = await callWithRequest(req, "search", params);

      const totalPolicies = _.get(searchResponse, "hits.total.value", 0);
      const policies = searchResponse.hits.hits.map(hit => ({
        seqNo: hit._seq_no as number,
        primaryTerm: hit._primary_term as number,
        id: hit._id,
        policy: hit._source,
      }));

      return { ok: true, resp: { policies: policies, totalPolicies } };
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return { ok: true, resp: { policies: [], totalPolicies: 0 } };
      }
      console.error("Index Management - PolicyService - getPolicies", err);
      return { ok: false, resp: null, error: err.message };
    }
  };
}
