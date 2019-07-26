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
import { GetManagedIndicesResponse, RetryManagedIndexResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";

export default class ManagedIndexService {
  httpClient: IHttpService;

  constructor(httpClient: IHttpService) {
    this.httpClient = httpClient;
  }

  getManagedIndex = async (managedIndexUuid: string): Promise<ServerResponse<any>> => {
    const response = (await this.httpClient.get(`..${NODE_API.MANAGED_INDICES}/${managedIndexUuid}`)) as IHttpResponse<ServerResponse<any>>;
    return response.data;
  };

  getManagedIndices = async (queryParamsString: string): Promise<ServerResponse<GetManagedIndicesResponse>> => {
    const response = (await this.httpClient.get(`..${NODE_API.MANAGED_INDICES}?${queryParamsString}`)) as IHttpResponse<
      ServerResponse<GetManagedIndicesResponse>
    >;
    return response.data;
  };

  retryManagedIndexPolicy = async (index: string[], state: string | null): Promise<ServerResponse<RetryManagedIndexResponse>> => {
    const body = { index, state };
    const response = (await this.httpClient.post(`..${NODE_API.RETRY}`, body)) as IHttpResponse<ServerResponse<RetryManagedIndexResponse>>;
    return response.data;
  };
}
