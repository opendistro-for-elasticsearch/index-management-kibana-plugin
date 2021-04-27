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

import {
  IClusterClient,
  IKibanaResponse,
  KibanaRequest,
  KibanaResponseFactory,
  RequestHandlerContext
} from "kibana/server";
import {ServerResponse} from "../models/types";
import {GetTransformResponse} from "../models/interfaces";
import {DocumentTransform} from "../../models/interfaces";

export default class TransformService {
  esDriver: IClusterClient;

  constructor(esDriver: IClusterClient) {
      this.esDriver = esDriver;
  }

  getTransforms = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ): Promise<IKibanaResponse<ServerResponse<GetTransformResponse>>> => {
    try {
      const { from, size, search, sortDirection, sortField } = request.query as {
        from: number;
        size: number;
        search: string;
        sortDirection: string;
        sortField: string;
      };

      const transformSortMap: { [key: string]: string } = {
        "_id": "transform.transform_id.keyword",
        "transform.source_index": "transform.source_index.keyword",
        "transform.target_index": "transform.target_index.keyword",
        "transform.transform.enabled": "transform.enabled",
      };

      // TODO: Correct the parsing
      const params = {
        // from: parseInt(from, 10),
        // size: parseInt(size, 10),
        // search,
        // sortField: transformSortMap[sortField] || transformSortMap._id,
        // sortDirection,
      };

      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(request);
      const getTransformsResponse = await callWithRequest("ism.getTransforms", params);
      const totalTransforms = getTransformsResponse.total_transforms;
      const transforms = getTransformsResponse.transforms.map((transform: DocumentTransform) => ({
        seqNo: transform._seqNo as number,
        primaryTerm: transform._primaryTerm as number,
        id: transform._id,
        transform: transform.transform,
        metadata: null
      }));

      return response.custom({
        statusCode: 200,
        body: {ok: true, response: {transforms: transforms, totalTransforms: totalTransforms, metadata: {}}},
      });
    } catch (err) {
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: "Error in getTransforms" + err.message,
        }
      })
    }
  };
}
