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

//TODO: Create actual rollup service here when backend is done.

import { IHttpResponse, IHttpService } from "angular";
import { INDEX } from "../../server/utils/constants";
import { PutRollupResponse, RollupJobsResponse, SearchResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import queryString from "query-string";
import { DocumentPolicy, Rollup } from "../../models/interfaces";

export default class RollupService {
  httpClient: IHttpService;

  constructor(httpClient: IHttpService) {
    this.httpClient = httpClient;
  }

  getRollups = async (queryParamsString: string): Promise<ServerResponse<RollupJobsResponse>> => {
    let url = `..${NODE_API._ROLLUP}`;
    if (queryParamsString) url += `?${queryParamsString}`;
    const response = (await this.httpClient.get(url)) as IHttpResponse<ServerResponse<RollupJobsResponse>>;
    return response.data;
  };

  /**
   * Calls backend Put Rollup API
   */
  putRollup = async (
    rollup: Rollup,
    rollupId: string,
    seqNo?: number,
    primaryTerm?: number
  ): Promise<ServerResponse<PutRollupResponse>> => {
    const queryParamsString = queryString.stringify({ seqNo, primaryTerm });
    let url = `..${NODE_API._ROLLUP}/${rollupId}`;
    if (queryParamsString) url += `?${queryParamsString}`;
    const response = (await this.httpClient.put(url, rollup)) as IHttpResponse<ServerResponse<PutRollupResponse>>;
    return response.data;
  };

  getRollup = async (rollupId: string): Promise<ServerResponse<DocumentPolicy>> => {
    const url = `..${NODE_API._ROLLUP}/${rollupId}`;
    const response = (await this.httpClient.get(url)) as IHttpResponse<ServerResponse<DocumentPolicy>>;
    return response.data;
  };

  deleteRollup = async (rollupId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API._ROLLUP}/${rollupId}`;
    const response = (await this.httpClient.delete(url)) as IHttpResponse<ServerResponse<boolean>>;
    return response.data;
  };
}
