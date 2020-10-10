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
import { GetIndicesResponse, PutRollupResponse, GetRollupsResponse, SearchResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import queryString from "query-string";
import { DocumentRollup, Rollup } from "../../models/interfaces";
import { INDEX } from "../../server/utils/constants";

export default class RollupService {
  httpClient: IHttpService;

  constructor(httpClient: IHttpService) {
    this.httpClient = httpClient;
  }

  getRollups = async (queryParamsString: string): Promise<ServerResponse<GetRollupsResponse>> => {
    let url = `..${NODE_API.ROLLUPS}`;
    if (queryParamsString) url += `?${queryParamsString}`;
    const response = (await this.httpClient.get(url)) as IHttpResponse<ServerResponse<GetRollupsResponse>>;
    return response.data;
  };

  getIndices = async (): Promise<ServerResponse<GetIndicesResponse>> => {
    let url = `..${NODE_API._INDICES}`;
    const response = (await this.httpClient.get(url)) as IHttpResponse<ServerResponse<GetIndicesResponse>>;
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
    let url = `..${NODE_API.ROLLUPS}/${rollupId}`;
    if (queryParamsString) url += `?${queryParamsString}`;
    console.log(rollup);
    const response = (await this.httpClient.put(url, rollup)) as IHttpResponse<ServerResponse<PutRollupResponse>>;
    return response.data;
  };

  getRollup = async (rollupId: string): Promise<ServerResponse<DocumentRollup>> => {
    const url = `..${NODE_API.ROLLUPS}/${rollupId}`;
    const response = (await this.httpClient.get(url)) as IHttpResponse<ServerResponse<DocumentRollup>>;
    return response.data;
  };

  deleteRollup = async (rollupId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.ROLLUPS}/${rollupId}`;
    const response = (await this.httpClient.delete(url)) as IHttpResponse<ServerResponse<boolean>>;
    return response.data;
  };

  searchIndices = async (searchValue: string, source: boolean = false): Promise<ServerResponse<SearchResponse<any>>> => {
    const str = searchValue.trim();
    const mustQuery = {
      query_string: {
        default_field: "index.policy_id",
        default_operator: "AND",
        query: str ? `*${str.split(" ").join("* *")}*` : "*",
      },
    };
    const body = {
      index: INDEX.OPENDISTRO_ISM_CONFIG,
      size: 10,
      query: { _source: source, query: { bool: { must: [mustQuery, { exists: { field: "policy" } }] } } },
    };
    const url = `..${NODE_API._SEARCH}`;
    const response = (await this.httpClient.post(url, body)) as IHttpResponse<ServerResponse<any>>;
    return response.data;
  };
}
