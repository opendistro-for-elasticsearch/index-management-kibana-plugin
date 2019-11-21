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
import { AcknowledgedResponse, ApplyPolicyResponse, AddResponse, CatIndex, GetIndicesResponse, SearchResponse } from "../models/interfaces";
import { ServerResponse } from "../models/types";

// import Request = Legacy.Request;
type Request = Legacy.Request;
type ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
type ResponseToolkit = Legacy.ResponseToolkit;

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

      // _cat doesn't support pagination, do our own in server pagination to at least reduce network bandwidth
      const fromNumber = parseInt(from, 10);
      const sizeNumber = parseInt(size, 10);
      const paginatedIndices = indicesResponse.slice(fromNumber, fromNumber + sizeNumber);
      const indexUuids = paginatedIndices.map((value: CatIndex) => value.uuid);

      const managedStatus = await this._getManagedStatus(req, indexUuids);

      return {
        ok: true,
        response: {
          indices: paginatedIndices.map((catIndex: CatIndex) => ({ ...catIndex, managed: managedStatus[catIndex.uuid] || "N/A" })),
          totalIndices: indicesResponse.length,
        },
      };
    } catch (err) {
      // Throws an error if there is no index matching pattern
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return { ok: true, response: { indices: [], totalIndices: 0 } };
      }
      console.error("Index Management - IndexService - getIndices:", err);
      return { ok: false, error: err.message };
    }
  };

  // given a list of indexUuids return the managed status of each (true, false, N/A)
  _getManagedStatus = async (req: Request, indexUuids: string[]): Promise<{ [indexUuid: string]: string }> => {
    try {
      const searchParams: RequestParams.Search = {
        index: INDEX.OPENDISTRO_ISM_CONFIG,
        size: indexUuids.length,
        body: { _source: "_id", query: { ids: { values: indexUuids } } },
      };
      const { callWithRequest: searchCallWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const results: SearchResponse<any> = await searchCallWithRequest(req, "search", searchParams);
      const managed: { [indexUuid: string]: string } = results.hits.hits.reduce(
        (accu: object, hit: { _id: string }) => ({ ...accu, [hit._id]: "Yes" }),
        {}
      );
      return indexUuids.reduce((accu: object, value: string) => ({ ...accu, [value]: managed[value] || "No" }), {});
    } catch (err) {
      // If the config index does not exist then nothing is being managed
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return indexUuids.reduce((accu, value) => ({ ...accu, [value]: "No" }), {});
      }
      // otherwise it could be an unauthorized access error to config index or some other error
      // in which case we will return managed status N/A
      console.error("Index Management - IndexService - _getManagedStatus:", err);
      return indexUuids.reduce((accu, value) => ({ ...accu, [value]: "N/A" }), {});
    }
  };

  applyPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<ApplyPolicyResponse>> => {
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
      console.error("Index Management - IndexService - applyPolicy:", err);
      return { ok: false, error: err.message };
    }
  };

  editRolloverAlias = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<AcknowledgedResponse>> => {
    try {
      const { alias, index } = req.payload as { alias: string; index: string };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.DATA);
      const params = { index, body: { [Setting.RolloverAlias]: alias } };
      const response = await callWithRequest(req, "indices.putSettings", params);
      return { ok: true, response };
    } catch (err) {
      console.error("Index Management - IndexService - editRolloverAlias", err);
      return { ok: false, error: err.message };
    }
  };
}
