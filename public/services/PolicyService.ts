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

import queryString from "query-string";
import { IHttpResponse, IHttpService } from "angular";
import { GetPoliciesResponse, PutRollupResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { DocumentPolicy, Policy } from "../../models/interfaces";

export default class PolicyService {
  httpClient: IHttpService;

  constructor(httpClient: IHttpService) {
    this.httpClient = httpClient;
  }

  getPolicies = async (queryParamsString: string): Promise<ServerResponse<GetPoliciesResponse>> => {
    let url = `..${NODE_API.POLICIES}`;
    if (queryParamsString) url += `?${queryParamsString}`;
    const response = (await this.httpClient.get(url)) as IHttpResponse<ServerResponse<GetPoliciesResponse>>;
    return response.data;
  };

  putPolicy = async (
    policy: Policy,
    policyId: string,
    seqNo?: number,
    primaryTerm?: number
  ): Promise<ServerResponse<PutRollupResponse>> => {
    const queryParamsString = queryString.stringify({ seqNo, primaryTerm });
    let url = `..${NODE_API.POLICIES}/${policyId}`;
    if (queryParamsString) url += `?${queryParamsString}`;
    const response = (await this.httpClient.put(url, policy)) as IHttpResponse<ServerResponse<PutRollupResponse>>;
    return response.data;
  };

  getPolicy = async (policyId: string): Promise<ServerResponse<DocumentPolicy>> => {
    const url = `..${NODE_API.POLICIES}/${policyId}`;
    const response = (await this.httpClient.get(url)) as IHttpResponse<ServerResponse<DocumentPolicy>>;
    return response.data;
  };

  deletePolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.POLICIES}/${policyId}`;
    const response = (await this.httpClient.delete(url)) as IHttpResponse<ServerResponse<boolean>>;
    return response.data;
  };
}
