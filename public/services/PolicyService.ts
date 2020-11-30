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

import { GetPoliciesResponse, PutPolicyResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { DocumentPolicy, Policy } from "../../models/interfaces";
import { HttpSetup } from "kibana/public";

export default class PolicyService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getPolicies = async (queryObject: object): Promise<ServerResponse<GetPoliciesResponse>> => {
    let url = `..${NODE_API.POLICIES}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetPoliciesResponse>;
    return response;
  };

  putPolicy = async (
    policy: Policy,
    policyId: string,
    seqNo?: number,
    primaryTerm?: number
  ): Promise<ServerResponse<PutPolicyResponse>> => {
    let url = `..${NODE_API.POLICIES}/${policyId}`;
    const response = (await this.httpClient.put(url, { query: { seqNo, primaryTerm }, body: JSON.stringify(policy) })) as ServerResponse<
      PutPolicyResponse
    >;
    return response;
  };

  getPolicy = async (policyId: string): Promise<ServerResponse<DocumentPolicy>> => {
    const url = `..${NODE_API.POLICIES}/${policyId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<DocumentPolicy>;
    return response;
  };

  deletePolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.POLICIES}/${policyId}`;
    const response = (await this.httpClient.delete(url)) as ServerResponse<boolean>;
    return response;
  };
}
