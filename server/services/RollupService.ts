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
import { CLUSTER, INDEX } from "../utils/constants";
import {
  DeleteRollupParams,
  DeleteRollupResponse,
  GetRollupsResponse,
  PutRollupParams,
  PutRollupResponse,
  SearchResponse,
} from "../models/interfaces";
import { getMustQuery } from "../utils/helpers";
import { RollupsSort, ServerResponse } from "../models/types";
import { DocumentRollup, Rollup, RollupMetadata } from "../../models/interfaces";

//Todo: modify this file to upgrade to 7.10

export default class RollupService {
  esDriver: IClusterClient;

  constructor(esDriver: IClusterClient) {
    this.esDriver = esDriver;
  }

  /**
   * Calls backend Put Rollup API
   */
  putRollup = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<PutRollupResponse> | ResponseError>> => {
    try {
      const { id } = request.params as { id: string };
      const { seqNo, primaryTerm } = request.query as { seqNo?: string; primaryTerm?: string };
      let method = "ism.putRollup";
      let params: PutRollupParams = {
        rollupId: id,
        if_seq_no: seqNo,
        if_primary_term: primaryTerm,
        body: JSON.stringify(request.body),
      };
      if (seqNo === undefined || primaryTerm === undefined) {
        method = "ism.createRollup";
        params = { rollupId: id, body: JSON.stringify(request.body) };
      }
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const putRollupResponse: PutRollupResponse = await callWithRequest(request, method, params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: putRollupResponse,
        },
      });
    } catch (err) {
      console.error("Index Management - RollupService - putRollup", err);
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
   * Calls backend Delete Rollup API
   */
  deleteRollup = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<boolean> | ResponseError>> => {
    try {
      const { id } = request.params as { id: string };
      const params: DeleteRollupParams = { rollupId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const deleteRollupResponse: DeleteRollupResponse = await callWithRequest(request, "ism.deleteRollup", params);
      if (response.result !== "deleted") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: deleteRollupResponse.result,
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
      console.error("Index Management - RollupService - deleteRollup:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  startRollup = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<boolean>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { rollupId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const startResponse = await callWithRequest(request, "ism.startRollup", params);
      const acknowledged = _.get(startResponse, "acknowledged");
      if (acknowledged) {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: true },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: "Failed to start rollup" },
        });
      }
    } catch (err) {
      console.error("Index Management - RollupService - startRollup:", err);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: err.message },
      });
    }
  };

  stopRollup = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<boolean>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { rollupId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const stopResponse = await callWithRequest(request, "ism.stopRollup", params);
      const acknowledged = _.get(stopResponse, "acknowledged");
      if (acknowledged) {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: true },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: "Failed to stop rollup" },
        });
      }
    } catch (err) {
      console.error("Index Management - RollupService - stopRollup:", err);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: err.message },
      });
    }
  };

  /**
   * Calls backend Get Rollup API
   */
  getRollup = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<DocumentRollup>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { rollupId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const getResponse = await callWithRequest(request, "ism.getRollup", params);
      const rollup = _.get(getResponse, "rollup", null);
      const seqNo = _.get(getResponse, "_seq_no");
      const primaryTerm = _.get(getResponse, "_primary_term");
      if (rollup) {
        response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { id, seqNo: seqNo as number, primaryTerm: primaryTerm as number, rollup: rollup as Rollup },
          },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: "Failed to load rollup",
          },
        });
      }
    } catch (err) {
      console.error("Index Management - RollupService - getRollup:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  getMappings = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<any>>> => {
    try {
      const { index } = request.body as { index: string };
      const params = { index: index };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const mappings = await callWithRequest(request, "indices.getMapping", params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: mappings,
        },
      });
    } catch (err) {
      console.error("Index Management - RollupService - getMapping:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  explainRollup = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<RollupMetadata[]>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { rollupId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const rollupMetadata = await callWithRequest(request, "ism.explainRollup", params);
      if (rollupMetadata) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: rollupMetadata,
          },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: "Failed to load rollup metadata",
          },
        });
      }
    } catch (err) {
      console.error("Index Management - RollupService - explainRollup:", err);
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
   * Performs a fuzzy search request on rollup id
   */
  getRollups = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<GetRollupsResponse>>> => {
    try {
      const { from, size, search, sortDirection, sortField } = request.query as {
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

      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const searchResponse: SearchResponse<any> = await callWithRequest(request, "search", params);

      const totalRollups = searchResponse.hits.total.value;
      const rollups = searchResponse.hits.hits.map((hit) => ({
        _seqNo: hit._seq_no as number,
        _primaryTerm: hit._primary_term as number,
        _id: hit._id,
        rollup: hit._source,
      }));

      let ids = "";
      rollups.map((rollup) => {
        if (rollups.indexOf(rollup) == 0) {
          ids = ids + rollup._id;
        } else {
          ids = ids + "," + rollup._id;
        }
      });
      return response.custom({
        statusCode: 200,
        body: { ok: true, response: { rollups: rollups, totalRollups: totalRollups } },
      });
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: { rollups: [], totalRollups: 0 } },
        });
      }
      console.error("Index Management - RollupService - getRollups", err);
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
