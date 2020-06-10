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
import {
  ChangePolicyResponse,
  GetManagedIndicesResponse,
  RemovePolicyResponse,
  RetryManagedIndexResponse,
} from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { HttpSetup, HttpResponse } from "kibana/public";

export default class ManagedIndexService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getManagedIndex = async (managedIndexUuid: string): Promise<ServerResponse<any>> => {
    const response = (await this.httpClient.get(`..${NODE_API.MANAGED_INDICES}/${managedIndexUuid}`)) as HttpResponse<ServerResponse<any>>;
    return response.body!;
  };

  getManagedIndices = async (queryParamsString: string): Promise<ServerResponse<GetManagedIndicesResponse>> => {
    let url = `..${NODE_API.MANAGED_INDICES}`;
    if (queryParamsString) url += `?${queryParamsString}`;
    const response = (await this.httpClient.get(url)) as HttpResponse<ServerResponse<GetManagedIndicesResponse>>;
    return response.body!;
  };

  retryManagedIndexPolicy = async (index: string[], state: string | null): Promise<ServerResponse<RetryManagedIndexResponse>> => {
    const body = { index, state };
    const response = (await this.httpClient.post(`..${NODE_API.RETRY}`, { body: JSON.stringify(body) })) as HttpResponse<
      ServerResponse<RetryManagedIndexResponse>
    >;
    return response.body!;
  };

  removePolicy = async (indices: string[]): Promise<ServerResponse<RemovePolicyResponse>> => {
    const body = { indices };
    const response = (await this.httpClient.post(`..${NODE_API.REMOVE_POLICY}`, { body: JSON.stringify(body) })) as HttpResponse<
      ServerResponse<RemovePolicyResponse>
    >;
    return response.body!;
  };

  changePolicy = async (
    indices: string[],
    policyId: string,
    state: string | null,
    include: object[]
  ): Promise<ServerResponse<ChangePolicyResponse>> => {
    const body = { indices, policyId, state, include };
    const response = (await this.httpClient.post(`..${NODE_API.CHANGE_POLICY}`, { body: JSON.stringify(body) })) as HttpResponse<
      ServerResponse<ChangePolicyResponse>
    >;
    return response.body!;
  };
}
