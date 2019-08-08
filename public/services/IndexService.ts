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

import { IHttpResponse, IHttpService } from "angular";
import { INDEX } from "../../server/utils/constants";
import { AddPolicyResponse, GetIndicesResponse, SearchResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";

export default class IndexService {
  httpClient: IHttpService;

  constructor(httpClient: IHttpService) {
    this.httpClient = httpClient;
  }

  getIndices = async (queryParamsString: string): Promise<ServerResponse<GetIndicesResponse>> => {
    const url = `..${NODE_API._INDICES}?${queryParamsString}`;
    const response = (await this.httpClient.get(url)) as IHttpResponse<ServerResponse<GetIndicesResponse>>;
    return response.data;
  };

  addPolicy = async (indices: string[], policyId: string): Promise<ServerResponse<AddPolicyResponse>> => {
    const body = { indices, policyId };
    const url = `..${NODE_API.ADD_POLICY}`;
    const response = (await this.httpClient.post(url, body)) as IHttpResponse<ServerResponse<AddPolicyResponse>>;
    return response.data;
  };

  searchPolicies = async (searchValue: string): Promise<ServerResponse<SearchResponse<any>>> => {
    const mustQuery = {
      query_string: {
        default_field: "policy.policy_id",
        default_operator: "AND",
        query: `*${searchValue
          .trim()
          .split(" ")
          .join("* *")}*`,
      },
    };
    const body = {
      index: INDEX.OPENDISTRO_ISM_CONFIG,
      size: 10,
      query: { _source: false, query: { bool: { must: [mustQuery, { exists: { field: "policy" } }] } } },
    };
    const url = `..${NODE_API._SEARCH}`;
    const response = (await this.httpClient.post(url, body)) as IHttpResponse<ServerResponse<any>>;
    return response.data;
  };
}
