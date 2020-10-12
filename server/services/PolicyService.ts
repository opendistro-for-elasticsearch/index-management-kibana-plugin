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
  PutPolicyParams,
  PutRollupResponse,
  SearchResponse,
} from "../models/interfaces";
import { getMustQuery } from "../utils/helpers";
import { PoliciesSort, ServerResponse } from "../models/types";
import { DocumentPolicy, Policy } from "../../models/interfaces";

type Request = Legacy.Request;
type ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
type ResponseToolkit = Legacy.ResponseToolkit;

export default class PolicyService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  /**
   * Calls backend Put Policy API
   */
  putPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<PutRollupResponse>> => {
    try {
      const { id } = req.params;
      const { seqNo, primaryTerm } = req.query as { seqNo?: string; primaryTerm?: string };
      let method = "ism.putPolicy";
      let params: PutPolicyParams = { policyId: id, ifSeqNo: seqNo, ifPrimaryTerm: primaryTerm, body: JSON.stringify(req.payload) };
      if (seqNo === undefined || primaryTerm === undefined) {
        method = "ism.createPolicy";
        params = { policyId: id, body: JSON.stringify(req.payload) };
      }
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response = await callWithRequest(req, method, params);
      return { ok: true, response: response };
    } catch (err) {
      console.error("Index Management - PolicyService - putPolicy:", err);
      return { ok: false, error: err.message };
    }
  };

  /**
   * Calls backend Delete Policy API
   */
  deletePolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<boolean>> => {
    try {
      const { id } = req.params;
      const params: DeletePolicyParams = { policyId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response: DeletePolicyResponse = await callWithRequest(req, "ism.deletePolicy", params);
      if (response.result !== "deleted") {
        return { ok: false, error: response.result };
      }
      return { ok: true, response: true };
    } catch (err) {
      console.error("Index Management - PolicyService - deletePolicy:", err);
      return { ok: false, error: err.message };
    }
  };

  /**
   * Calls backend Get Policy API
   */
  getPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<DocumentPolicy>> => {
    try {
      const { id } = req.params;
      const params = { policyId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const getResponse = await callWithRequest(req, "ism.getPolicy", params);
      const policy = _.get(getResponse, "policy", null);
      const seqNo = _.get(getResponse, "_seq_no");
      const primaryTerm = _.get(getResponse, "_primary_term");
      if (policy) {
        return { ok: true, response: { id, seqNo: seqNo as number, primaryTerm: primaryTerm as number, policy: policy as Policy } };
      } else {
        return { ok: false, error: "Failed to load policy" };
      }
    } catch (err) {
      console.error("Index Management - PolicyService - getPolicy:", err);
      return { ok: false, error: err.message };
    }
  };

  /**
   * Performs a fuzzy search request on policy id
   */
  getPolicies = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetPoliciesResponse>> => {
    try {
      const { from, size, search, sortDirection, sortField } = req.query as {
        from: string;
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
              must: getMustQuery("policy.policy_id", search),
            },
          },
        },
      };

      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.DATA);
      const searchResponse: SearchResponse<any> = await callWithRequest(req, "search", params);

      const totalPolicies = searchResponse.hits.total.value;
      const policies = searchResponse.hits.hits.map((hit) => ({
        seqNo: hit._seq_no as number,
        primaryTerm: hit._primary_term as number,
        id: hit._id,
        policy: hit._source,
      }));

      return { ok: true, response: { policies: policies, totalPolicies } };
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return { ok: true, response: { policies: [], totalPolicies: 0 } };
      }
      console.error("Index Management - PolicyService - getPolicies", err);
      return { ok: false, error: err.message };
    }
  };
}
