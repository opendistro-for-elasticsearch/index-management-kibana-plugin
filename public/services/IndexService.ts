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
import { AddPolicyResponse, GetIndicesResponse, SearchResponse, ServerResponse } from "../../server/models/interfaces";

export default class IndexService {
  httpClient: IHttpService;

  constructor(httpClient: IHttpService) {
    this.httpClient = httpClient;
  }

  getIndices = async (queryParamsString: string): Promise<ServerResponse<GetIndicesResponse>> => {
    const response: IHttpResponse<ServerResponse<GetIndicesResponse>> = await this.httpClient.get(
      `../api/ism/_indices?${queryParamsString}`
    );
    return response.data;
  };

  addPolicy = async (indices: string[], policyId: string): Promise<ServerResponse<AddPolicyResponse>> => {
    const body = { indices, policyId };
    const response = await this.httpClient.post("../api/ism/addPolicy", body);
    return response.data;
  };

  searchPolicies = async (searchValue: string): Promise<ServerResponse<SearchResponse<any>>> => {
    // TODO: We want want to search the policy_id, but _id does not allow
    //  fuzzy matching so we need to store the policy_id in the document,
    //  as temporary placeholder we will search policy.name for development
    const mustQuery = {
      query_string: {
        default_field: "policy.name",
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
    const response = await this.httpClient.post("../api/ism/_search", body);
    return response.data;
  };
}
