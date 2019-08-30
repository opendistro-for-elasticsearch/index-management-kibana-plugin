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

import { Legacy } from "kibana";
import { RequestParams } from "@elastic/elasticsearch";
import { CLUSTER, INDEX, Setting } from "../utils/constants";
import { AcknowledgedResponse, AddPolicyResponse, AddResponse, CatIndex, GetIndicesResponse, SearchResponse } from "../models/interfaces";
import { ServerResponse } from "../models/types";

import Request = Legacy.Request;
import ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
import ResponseToolkit = Legacy.ResponseToolkit;

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
      return { ok: true, response: results };
    } catch (err) {
      console.error("Index Management - IndexService - search", err);
      return { ok: false, error: err.message };
    }
  };

  // TODO: Create a new API on backend that supports from/size _cat pagination
  // TODO: show which indices are being managed by doing a second request to our ism config index
  getIndices = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetIndicesResponse>> => {
    try {
      // @ts-ignore
      const { from, size, search, sortField, sortDirection } = req.query as {
        from: string;
        size: string;
        search: string;
        sortField: string;
        sortDirection: string;
      };
      const params = {
        index: `*${search
          .trim()
          .split(" ")
          .join("* *")}*`,
        format: "json",
        s: `${sortField}:${sortDirection}`,
      };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const indicesResponse: CatIndex[] = await callWithRequest(req, "cat.indices", params);
      return { ok: true, response: { indices: indicesResponse, totalIndices: indicesResponse.length } };
    } catch (err) {
      // Throws an error if there is no index matching pattern
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return { ok: true, response: { indices: [], totalIndices: 0 } };
      }
      console.error("Index Management - IndexService - getIndices:", err);
      return { ok: false, error: err.message };
    }
  };

  addPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<AddPolicyResponse>> => {
    try {
      const { indices, policyId } = req.payload as { indices: string[]; policyId: string };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const params = { index: indices.join(","), body: { policy_id: policyId } };
      const addResponse: AddResponse = await callWithRequest(req, "ism.add", params);
      return {
        ok: true,
        response: {
          failures: addResponse.failures,
          updatedIndices: addResponse.updated_indices,
          failedIndices: addResponse.failed_indices.map(failedIndex => ({
            indexName: failedIndex.index_name,
            indexUuid: failedIndex.index_uuid,
            reason: failedIndex.reason,
          })),
        },
      };
    } catch (err) {
      console.error("Index Management - IndexService - addPolicy:", err);
      return { ok: false, error: err.message };
    }
  };

  addRolloverAlias = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<AcknowledgedResponse>> => {
    try {
      const { alias, index } = req.payload as { alias: string; index: string };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.DATA);
      const params = { index, body: { [Setting.RolloverAlias]: alias } };
      const response = await callWithRequest(req, "indices.putSettings", params);
      return { ok: true, response };
    } catch (err) {
      console.error("Index Management - IndexService - addRolloverAlias", err);
      return { ok: false, error: err.message };
    }
  };
}
