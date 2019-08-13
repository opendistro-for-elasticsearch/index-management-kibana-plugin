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

import { httpClientMock } from "../../test/mocks";
import IndexService from "./IndexService";
import { NODE_API } from "../../utils/constants";

const indexService = new IndexService(httpClientMock);

describe("IndexService spec", () => {
  it("calls get indices nodejs route when calling getIndices", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryParamsString = "test";
    await indexService.getIndices(queryParamsString);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API._INDICES}?${queryParamsString}`);
  });

  it("calls add policy nodejs route when calling addPolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indices = ["one", "two"];
    const policyId = "test";
    await indexService.addPolicy(indices, policyId);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.ADD_POLICY}`, { indices, policyId });
  });

  it("calls search nodejs route when calling searchPolicies", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const searchValue = "test";
    await indexService.searchPolicies(searchValue);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
  });
});
