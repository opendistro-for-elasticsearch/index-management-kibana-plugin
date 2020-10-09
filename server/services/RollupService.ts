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
  CatIndex,
  DeleteRollupParams,
  DeleteRollupResponse,
  GetIndicesResponse,
  GetRollupsResponse,
  PutRollupParams,
  PutRollupResponse,
  SearchResponse,
} from "../models/interfaces";
import { getMustQuery } from "../utils/helpers";
import { RollupsSort, ServerResponse } from "../models/types";
import { DocumentRollup, Rollup } from "../../models/interfaces";

type Request = Legacy.Request;
type ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
type ResponseToolkit = Legacy.ResponseToolkit;

export default class RollupService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

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
      const str = search.trim();
      const params = {
        index: str ? `*${str.split(" ").join("* *")}*` : "*",
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

  /**
   * Calls backend Put Rollup API
   */
  putRollup = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<PutRollupResponse>> => {
    try {
      const { id } = req.params;
      const { seqNo, primaryTerm } = req.query as { seqNo?: string; primaryTerm?: string };
      let method = "ism.putRollup";
      let params: PutRollupParams = { rollupId: id, ifSeqNo: seqNo, ifPrimaryTerm: primaryTerm, body: JSON.stringify(req.payload) };
      if (seqNo === undefined || primaryTerm === undefined) {
        method = "ism.createRollup";
        params = { rollupId: id, body: JSON.stringify(req.payload) };
      }
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response = await callWithRequest(req, method, params);
      return { ok: true, response: response };
    } catch (err) {
      console.error("Index Management - RollupService - putRollup", err);
      return { ok: false, error: err.message };
    }
  };

  /**
   * Calls backend Delete Rollup API
   */
  deleteRollup = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<boolean>> => {
    try {
      const { id } = req.params;
      const params: DeleteRollupParams = { rollupId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response: DeleteRollupResponse = await callWithRequest(req, "ism.deleteRollup", params);
      if (response.result !== "deleted") {
        return { ok: false, error: response.result };
      }
      return { ok: true, response: true };
    } catch (err) {
      console.error("Index Management - RollupService - deleteRollup:", err);
      return { ok: false, error: err.message };
    }
  };

  /**
   * Calls backend Get Rollup API
   */
  //TODO: Figure out the part for DocumentPolicy
  getRollup = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<DocumentRollup>> => {
    try {
      const { id } = req.params;
      const params = { rollupId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const getResponse = await callWithRequest(req, "ism.getRollup", params);
      const rollup = _.get(getResponse, "rollup", null);
      const seqNo = _.get(getResponse, "_seq_no");
      const primaryTerm = _.get(getResponse, "_primary_term");
      if (rollup) {
        return { ok: true, response: { id, seqNo: seqNo as number, primaryTerm: primaryTerm as number, rollup: rollup as Rollup } };
      } else {
        return { ok: false, error: "Failed to load rollup" };
      }
    } catch (err) {
      console.error("Index Management - RollupService - getRollup:", err);
      return { ok: false, error: err.message };
    }
  };

  /**
   * Performs a fuzzy search request on rollup id
   */
  getRollups = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetRollupsResponse>> => {
    try {
      const { from, size, search, sortDirection, sortField } = req.query as {
        from: string;
        size: string;
        search: string;
        sortDirection: string;
        sortField: string;
      };

      const rollupSorts: RollupsSort = {
        id: "rollup.rollup_id.keyword",
        "rollup.rollup.description": "rollup.description.keyword",
        "rollup.rollup.last_updated_time": "rollup.last_updated_time",
      };
      const params = {
        index: INDEX.OPENDISTRO_ISM_CONFIG,
        seq_no_primary_term: true,
        body: {
          size,
          from,
          sort: rollupSorts[sortField] ? [{ [rollupSorts[sortField]]: sortDirection }] : [],
          query: {
            bool: {
              filter: [{ exists: { field: "rollup" } }],
              must: getMustQuery("rollup.rollup_id", search),
            },
          },
        },
      };

      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.DATA);
      const searchResponse: SearchResponse<any> = await callWithRequest(req, "search", params);

      const totalRollups = searchResponse.hits.total.value;
      const rollups = searchResponse.hits.hits.map((hit) => ({
        seqNo: hit._seq_no as number,
        primaryTerm: hit._primary_term as number,
        id: hit._id,
        rollup: hit._source,
      }));

      return { ok: true, response: { rollups: rollups, totalRollups } };
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return { ok: true, response: { rollups: [], totalRollups: 0 } };
      }
      console.error("Index Management - RollupService - getRollups", err);
      return { ok: false, error: err.message };
    }
  };
}
