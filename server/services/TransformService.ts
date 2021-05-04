/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { IClusterClient, IKibanaResponse, KibanaRequest, KibanaResponseFactory, RequestHandlerContext } from "kibana/server";
import { ServerResponse } from "../models/types";
import { GetTransformsResponse, PutTransformParams, PutTransformResponse, SearchResponse } from "../models/interfaces";
import { DocumentTransform, Transform } from "../../models/interfaces";
import _ from "lodash";

export default class TransformService {
  esDriver: IClusterClient;

  constructor(esDriver: IClusterClient) {
    this.esDriver = esDriver;
  }

  getTransforms = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<GetTransformsResponse>>> => {
    try {
      const { from, size, search, sortDirection, sortField } = request.query as {
        from: number;
        size: number;
        search: string;
        sortDirection: string;
        sortField: string;
      };

      const transformSortMap: { [key: string]: string } = {
        _id: "transform.transform_id.keyword",
        "transform.source_index": "transform.source_index.keyword",
        "transform.target_index": "transform.target_index.keyword",
        "transform.transform.enabled": "transform.enabled",
      };

      const params = {
        from: parseInt(from, 10),
        size: parseInt(size, 10),
        search,
        sortField: transformSortMap[sortField] || transformSortMap._id,
        sortDirection,
      };

      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const getTransformsResponse = await callWithRequest("ism.getTransforms", params);
      const totalTransforms = getTransformsResponse.total_transforms;
      const transforms = getTransformsResponse.transforms.map((transform: DocumentTransform) => ({
        _seqNo: transform._seqNo as number,
        _primaryTerm: transform._primaryTerm as number,
        _id: transform._id,
        transform: transform.transform,
        metadata: null,
      }));
      if (totalTransforms) {
        const ids = transforms.map((transform: DocumentTransform) => transform._id).join(",");
        const explainResponse = await callWithRequest("ism.explainTransform", { transformId: ids });
        if (!explainResponse.error) {
          transforms.map((transform: DocumentTransform) => {
            transform.metadata = explainResponse[transform._id];
          });

          return response.custom({
            statusCode: 200,
            body: { ok: true, response: { transforms: transforms, totalTransforms: totalTransforms, metadata: explainResponse } },
          });
        } else {
          return response.custom({
            statusCode: 200,
            body: {
              ok: false,
              error: explainResponse ? explainResponse.error : "An error occurred when calling getExplain API.",
            },
          });
        }
      }

      return response.custom({
        statusCode: 200,
        body: { ok: true, response: { transforms: transforms, totalTransforms: totalTransforms, metadata: {} } },
      });
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: { transforms: [], totalTransforms: 0, metadata: null } },
        });
      }
      console.error("Index Management - TransformService - getTransforms", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: "Error in getTransforms" + err.message,
        },
      });
    }
  };

  getTransform = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<DocumentTransform>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { transformId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const getResponse = await callWithRequest("ism.getTransform", params);
      const metadata = await callWithRequest("ism.explainTransform", params);
      const transform = _.get(getResponse, "transform", null);
      const seqNo = _.get(getResponse, "_seq_no", null);
      const primaryTerm = _.get(getResponse, "_primary_term", null);

      if (transform) {
        if (metadata) {
          return response.custom({
            statusCode: 200,
            body: {
              ok: true,
              response: {
                _id: id,
                _seqNo: seqNo as number,
                _primaryTerm: primaryTerm as number,
                transform: transform as Transform,
                metadata: metadata,
              },
            },
          });
        } else {
          return response.custom({
            statusCode: 200,
            body: {
              ok: false,
              error: "Failed to load metadata for transform",
            },
          });
        }
      } else {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: "Failed to load transform",
          },
        });
      }
    } catch (err) {
      console.error("Index Management - TransformService - getTransform:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  startTransform = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<boolean>>> => {
    try {
      const { id } = request.params as { id: string };
      console.log("received " + JSON.stringify(request.params));
      const params = { transformId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const startResponse = await callWithRequest("ism.startTransform", params);
      const acknowledged = _.get(startResponse, "acknowledged");
      if (acknowledged) {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: true },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: "Failed to start transform" },
        });
      }
    } catch (err) {
      console.error("Index Management - TransformService - startTransform", err);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: err.message },
      });
    }
  };

  stopTransform = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<boolean>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { transformId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const stopResponse = await callWithRequest("ism.stopTransform", params);
      const acknowledged = _.get(stopResponse, "acknowledged");
      if (acknowledged) {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: true },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: "Failed to stop transform" },
        });
      }
    } catch (err) {
      console.error("Index Management - TransformService - stopTransform", err);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: err.message },
      });
    }
  };

  deleteTransform = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<boolean>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { transformId: id };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const deleteResponse = await callWithRequest("ism.deleteTransform", params);
      const acknowledged = _.get(deleteResponse, "acknowledged");
      if (acknowledged) {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: true },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: "Failed to delete transform" },
        });
      }
    } catch (err) {
      console.error("Index Management - TransformService - deleteTransform", err);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: err.message },
      });
    }
  };

  putTransform = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<PutTransformResponse>>> => {
    try {
      const { id } = request.params as { id: string };
      const { seqNo, primaryTerm } = request.query as { seqNo?: string; primaryTerm?: string };
      let method = "ism.putTransform";
      let params: PutTransformParams = {
        transformId: id,
        if_seq_no: seqNo,
        if_primary_term: primaryTerm,
        body: JSON.stringify(request.body),
      };
      if (seqNo === undefined || primaryTerm === undefined) {
        method = "ism.putTransform";
        params = { transformId: id, body: JSON.stringify(request.body) };
      }
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const putTransformResponse: PutTransformResponse = await callWithRequest(method, params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: putTransformResponse,
        },
      });
    } catch (err) {
      console.error("Index Management - TransformService - putTransform", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  searchSampleData = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<any>>> => {
    try {
      const { from, size } = request.query as {
        from: string;
        size: string;
      };
      const { index } = request.params as { index: string };
      const params = {
        index: index,
        from: from,
        size: size,
      };
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const searchResponse: SearchResponse<any> = await callWithRequest("search", params);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            total: searchResponse.hits.total,
            data: searchResponse.hits.hits,
          },
        },
      });
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: {
              total: 0,
              data: [],
            },
          },
        });
      }
      console.error("Index Management - TransformService - searchSampleData", err);
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
