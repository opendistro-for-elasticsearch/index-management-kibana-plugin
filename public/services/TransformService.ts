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

import { HttpSetup } from "kibana/public";
import { ServerResponse } from "../../server/models/types";
import { GetTransformsResponse, PutTransformResponse } from "../../server/models/interfaces";
import { NODE_API } from "../../utils/constants";
import { DocumentTransform, Transform } from "../../models/interfaces";

export default class TransformService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getTransforms = async (queryObject: object): Promise<ServerResponse<GetTransformsResponse>> => {
    const url = `..${NODE_API.TRANSFORMS}`;
    // @ts-ignore
    return (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetTransformsResponse>;
  };

  putTransform = async (
    transform: Transform,
    transformId: string,
    seqNo?: number,
    primaryTerm?: number
  ): Promise<ServerResponse<PutTransformResponse>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    return (await this.httpClient.put(url, { query: { seqNo, primaryTerm }, body: JSON.stringify(transform) })) as ServerResponse<
      PutTransformResponse
    >;
  };

  getTransform = async (transformId: string): Promise<ServerResponse<DocumentTransform>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    return (await this.httpClient.get(url)) as ServerResponse<DocumentTransform>;
  };

  deleteTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    return (await this.httpClient.delete(url)) as ServerResponse<boolean>;
  };

  startTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}/_start`;
    return (await this.httpClient.post(url)) as ServerResponse<boolean>;
  };

  stopTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}/_stop`;
    return (await this.httpClient.post(url)) as ServerResponse<boolean>;
  };

  previewTransform = async (transform: Map<String, any>): Promise<ServerResponse<Map<String, []>>> => {
    const url = `..${NODE_API.TRANSFORMS}/_preview`;
    return (await this.httpClient.post(url, { body: JSON.stringify(transform) })) as ServerResponse<Map<String, []>>;
  };
}
