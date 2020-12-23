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
      const putRollupResponse: PutRollupResponse = await callWithRequest(method, params);
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
      const deleteRollupResponse: DeleteRollupResponse = await callWithRequest("ism.deleteRollup", params);
      if (deleteRollupResponse.result !== "deleted") {
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
      const startResponse = await callWithRequest("ism.startRollup", params);
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
      const stopResponse = await callWithRequest("ism.stopRollup", params);
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
      const getResponse = await callWithRequest("ism.getRollups", params);
      const metadata = await callWithRequest("ism.explainRollup", params);
      const rollup = _.get(getResponse, "rollup", null);
      const seqNo = _.get(getResponse, "_seq_no");
      const primaryTerm = _.get(getResponse, "_primary_term");

      //Form response
      if (rollup) {
        if (metadata) {
          return response.custom({
            statusCode: 200,
            body: {
              ok: true,
              response: {
                _id: id,
                _seqNo: seqNo as number,
                _primaryTerm: primaryTerm as number,
                rollup: rollup as Rollup,
                metadata: metadata,
              },
            },
          });
        } else
          return response.custom({
            statusCode: 200,
            body: {
              ok: false,
              error: "Failed to load metadata",
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
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const mappings = await callWithRequest("indices.getMapping", params);
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
    response: KibanaResponseFactory,
    idParams: string
  ): Promise<IKibanaResponse<ServerResponse<RollupMetadata[]>>> => {
    try {
      const params = { rollupId: idParams };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const rollupMetadata = await callWithRequest("ism.explainRollup", params);
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
          error: "Explain rollup: " + err.message,
        },
      });
    }
  };

  getRollups = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<GetRollupsResponse>>> => {
    try {
      const { from, size, search, sortDirection, sortField } = request.query as {
        from: number;
        size: number;
        search: string;
        sortDirection: string;
        sortField: string;
      };

      const params = {
        from,
        size,
        search,
        sortField,
        sortDirection,
      };

      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const getRollupResponse: GetRollupsResponse = await callWithRequest("ism.getRollups", params);
      const totalRollups = getRollupResponse.totalRollups;
      const rollups = getRollupResponse.rollups.map((rollup) => ({
        _seqNo: rollup._seqNo as number,
        _primaryTerm: rollup._primaryTerm as number,
        _id: rollup._id,
        rollup: rollup,
        metadata: null,
      }));

      if (totalRollups) {
        const ids = rollups.map((rollup) => rollup._id).join(",");
        const explainResponse = await this.explainRollup(context, request, response, ids);
        if (explainResponse.payload.ok) {
          rollups.map((item) => {
            item.metadata = explainResponse.payload.response[item._id];
          });
          return response.custom({
            statusCode: 200,
            body: { ok: true, response: { rollups: rollups, totalRollups: totalRollups, metadata: explainResponse } },
          });
        } else
          return response.custom({
            statusCode: 200,
            body: { ok: false, error: explainResponse.payload.error },
          });
      }
      return response.custom({
        statusCode: 200,
        body: { ok: true, response: { rollups: rollups, totalRollups: totalRollups, metadata: {} } },
      });
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: { rollups: [], totalRollups: 0, metadata: null } },
        });
      }
      console.error("Index Management - RollupService - getRollups", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: "Error in getRollups " + err.message,
        },
      });
    }
  };
}
