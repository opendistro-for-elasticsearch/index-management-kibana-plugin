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
import PolicyService from "./PolicyService";
import { NODE_API } from "../../utils/constants";

const policyService = new PolicyService(httpClientMock);

describe("PolicyService spec", () => {
  it("calls get policy nodejs route when calling getPolicy", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const policyId = "test";
    await policyService.getPolicy(policyId);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.POLICIES}/${policyId}`);
  });

  it("calls get policies nodejs route when calling getPolicies", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryParamsString = "test";
    await policyService.getPolicies(queryParamsString);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.POLICIES}?${queryParamsString}`);
  });

  it("calls put policy nodejs route when calling putPolicy", async () => {
    httpClientMock.put = jest.fn().mockResolvedValue({ data: {} });
    const policy = { description: "description", default_state: "one", states: [] };
    const policyId = "policy_id";
    await policyService.putPolicy(policy, policyId);

    expect(httpClientMock.put).toHaveBeenCalledTimes(1);
    expect(httpClientMock.put).toHaveBeenCalledWith(`..${NODE_API.POLICIES}/${policyId}?`, policy);
  });

  it("calls delete policy nodejs route when calling deletePolicy", async () => {
    httpClientMock.delete = jest.fn().mockResolvedValue({ data: {} });
    const policyId = "policy_id";
    await policyService.deletePolicy(policyId);

    expect(httpClientMock.delete).toHaveBeenCalledTimes(1);
    expect(httpClientMock.delete).toHaveBeenCalledWith(`..${NODE_API.POLICIES}/${policyId}`);
  });
});
