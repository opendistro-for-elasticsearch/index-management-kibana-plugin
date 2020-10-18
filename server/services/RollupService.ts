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
import { Legacy } from "kibana";
import { CLUSTER, INDEX } from "../utils/constants";
import {
  DeleteRollupParams,
  DeleteRollupResponse,
  GetFieldsResponse,
  GetRollupsResponse,
  PutRollupParams,
  PutRollupResponse,
  SearchResponse,
} from "../models/interfaces";
import { getMustQuery } from "../utils/helpers";
import { RollupsSort, ServerResponse } from "../models/types";
import { DocumentRollup, Rollup, RollupMetadata } from "../../models/interfaces";

type Request = Legacy.Request;
type ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
type ResponseToolkit = Legacy.ResponseToolkit;

export default class RollupService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  /**
   * Calls backend Put Rollup API
   */
  putRollup = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<PutRollupResponse>> => {
    try {
      const { id } = req.params;
      const { seqNo, primaryTerm } = req.query as { seqNo?: string; primaryTerm?: string };
      let method = "ism.putRollup";
      let params: PutRollupParams = { rollupId: id, if_seq_no: seqNo, if_primary_term: primaryTerm, body: JSON.stringify(req.payload) };
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
      if (response.result != "deleted") {
        return { ok: false, error: response.result };
      }
      return { ok: true, response: true };
    } catch (err) {
      console.error("Index Management - RollupService - deleteRollup:", err);
      return { ok: false, error: err.message };
    }
  };

  startRollup = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<boolean>> => {
    try {
      const { id } = req.params;
      const params = { rollupId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const getResponse = await callWithRequest(req, "ism.startRollup", params);
      const acknowledged = _.get(getResponse, "acknowledged");
      console.log(getResponse);
      if (acknowledged) {
        return { ok: true, response: true };
      } else {
        return { ok: false, error: "Failed to start rollup" };
      }
    } catch (err) {
      console.error("Index Management - RollupService - startRollup:", err);
      return { ok: false, error: err.message };
    }
  };

  stopRollup = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<boolean>> => {
    try {
      const { id } = req.params;
      const params = { rollupId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const getResponse = await callWithRequest(req, "ism.stopRollup", params);
      const acknowledged = _.get(getResponse, "acknowledged");
      if (acknowledged) {
        return { ok: true, response: true };
      } else {
        return { ok: false, error: "Failed to stop rollup" };
      }
    } catch (err) {
      console.error("Index Management - RollupService - stopRollup:", err);
      return { ok: false, error: err.message };
    }
  };

  /**
   * Calls backend Get Rollup API
   */
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

  getMappings = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetFieldsResponse>> => {
    try {
      const { index } = req.params;
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const mappings = await callWithRequest(req, "indices.getMapping", { index });
      return { ok: true, response: mappings };
    } catch (err) {
      console.error("Index Management - RollupService - getFields:", err);
      return { ok: false, error: err.message };
    }
  };

  explainRollup = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<RollupMetadata>> => {
    try {
      const { id } = req.params;
      const params = { rollupId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const rollupMetadata = await callWithRequest(req, "ism.explainRollup", params);
      console.log(rollupMetadata);
      if (rollupMetadata[id] != null) {
        return { ok: true, response: rollupMetadata };
      } else {
        return { ok: false, error: "Failed to load rollup" };
      }
    } catch (err) {
      console.error("Index Management - RollupService - explainRollup:", err);
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
