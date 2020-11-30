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
    const queryObject = {};
    await indexService.getIndices(queryObject);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API._INDICES}`, { query: queryObject });
  });

  it("calls apply policy nodejs route when calling applyPolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indices = ["one", "two"];
    const policyId = "test";
    await indexService.applyPolicy(indices, policyId);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.APPLY_POLICY}`, { body: JSON.stringify({ indices, policyId }) });
  });

  it("calls search nodejs route when calling searchPolicies", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const searchValue = "test";
    await indexService.searchPolicies(searchValue);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
  });
});
