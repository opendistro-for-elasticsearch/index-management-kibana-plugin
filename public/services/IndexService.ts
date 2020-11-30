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

// import { IHttpResponse, IHttpService } from "angular";
import { INDEX } from "../../server/utils/constants";
import { AcknowledgedResponse, ApplyPolicyResponse, GetIndicesResponse, SearchResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { HttpSetup } from "kibana/public";

export default class IndexService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getIndices = async (queryObject: object): Promise<ServerResponse<GetIndicesResponse>> => {
    let url = `..${NODE_API._INDICES}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetIndicesResponse>;
    return response;
  };

  applyPolicy = async (indices: string[], policyId: string): Promise<ServerResponse<ApplyPolicyResponse>> => {
    const body = { indices, policyId };
    const url = `..${NODE_API.APPLY_POLICY}`;
    const response = (await this.httpClient.post(url, { body: JSON.stringify(body) })) as ServerResponse<ApplyPolicyResponse>;
    return response;
  };

  editRolloverAlias = async (index: string, alias: string): Promise<ServerResponse<AcknowledgedResponse>> => {
    const body = { index, alias };
    const url = `..${NODE_API.EDIT_ROLLOVER_ALIAS}`;
    const response = (await this.httpClient.post(url, { body: JSON.stringify(body) })) as ServerResponse<AcknowledgedResponse>;
    return response;
  };

  searchPolicies = async (searchValue: string, source: boolean = false): Promise<ServerResponse<SearchResponse<any>>> => {
    const str = searchValue.trim();
    const mustQuery = {
      query_string: {
        default_field: "policy.policy_id",
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
    const response = (await this.httpClient.post(url, { body: JSON.stringify(body) })) as ServerResponse<any>;
    return response;
  };
}
