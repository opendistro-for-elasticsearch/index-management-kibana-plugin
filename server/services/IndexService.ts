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

import { CLUSTER } from "../utils/constants";
import { Legacy } from "kibana";
import { RequestParams } from "@elastic/elasticsearch";
import Request = Legacy.Request;
import ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
import ResponseToolkit = Legacy.ResponseToolkit;
import { GetIndicesResponse, SearchResponse, ServerResponse } from "../models/interfaces";

export default class IndexService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  search = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<any>> => {
    try {
      const { query, index, size = 0 } = req.payload as { query: object; index: string; size?: number };
      const params: RequestParams.Search = { index, size, body: query };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const results: SearchResponse<any> = await callWithRequest(req, "search", params);
      return { ok: true, resp: results };
    } catch (err) {
      console.error("Index Management - IndexService - search", err);
      return { ok: false, resp: null, error: err.message };
    }
  };

  // TODO: Create a new API on backend that supports _cat pagination
  getIndices = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetIndicesResponse>> => {
    try {
      const { index } = req.payload as { index: string };
      const params = { index, format: "json" };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const indicesResponse = await callWithRequest(req, "cat.indices", params);
      console.log("indicesrepo:", indicesResponse);
      return { ok: true, resp: { indices: indicesResponse } };
    } catch (err) {
      console.error("Index Management - IndexService - getIndices:", err);
      return { ok: false, resp: null, error: err.message };
    }
  };

  // TODO: Use backend API when implemented
  //  Will have failures: boolean, failed_indices: List<string>
  //  Ignore this in PR as it will change and is only temporary
  addPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<any>> => {
    try {
      const { indices, policyId } = req.payload as { indices: string[]; policyId: string };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const response = await callWithRequest(req, "indices.putSettings", {
        index: indices.join(","),
        body: { "opendistro.index_state_management.policy_name": policyId },
      });
      if (response.acknowledged) {
        return { ok: true, resp: indices };
      }

      return { ok: false, resp: null, error: "Adding policy was not acknowledged" };
    } catch (err) {
      console.error("Index Management - IndexService - addPolicy:", err);
      return { ok: false, resp: null, error: err.message };
    }
  };
}
