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
import ManagedIndexService from "./ManagedIndexService";
import { NODE_API } from "../../utils/constants";

const managedIndexService = new ManagedIndexService(httpClientMock);

describe("ManagedIndexService spec", () => {
  it("calls get managed index nodejs route when calling getManagedIndex", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const managedIndexUuid = "test";
    await managedIndexService.getManagedIndex(managedIndexUuid);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.MANAGED_INDICES}/${managedIndexUuid}`);
  });

  it("calls get managed indices nodejs route when calling getManagedIndices", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryParamsString = "test";
    await managedIndexService.getManagedIndices(queryParamsString);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.MANAGED_INDICES}?${queryParamsString}`);
  });

  it("calls retry policy nodejs route when calling retryManagedIndexPolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const index = ["one", "two"];
    const state = "test";
    await managedIndexService.retryManagedIndexPolicy(index, state);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.RETRY}`, { index, state });
  });

  it("calls remove policy nodejs route when calling removePolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indices = ["one", "two"];
    await managedIndexService.removePolicy(indices);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.REMOVE_POLICY}`, { indices });
  });

  it("calls change policy nodejs route when calling changePolicy", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indices = ["one", "two"];
    const policyId = "test";
    const state = "state_test";
    const include: object[] = [];
    await managedIndexService.changePolicy(indices, policyId, state, include);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.CHANGE_POLICY}`, { indices, policyId, state, include });
  });
});
