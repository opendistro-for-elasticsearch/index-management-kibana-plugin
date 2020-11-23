/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { NODE_API } from "../../utils/constants";
import RollupService from "./RollupService";
import { testRollup } from "../pages/CreateRollup/utils/constants";

const rollupService = new RollupService(httpClientMock);

describe("rollupService spec", () => {
  it("calls get rollup nodejs route when calling getRollup", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const rollupId = "test";
    await rollupService.getRollup(rollupId);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.ROLLUPS}/${rollupId}`);
  });

  it("calls get rollups nodejs route when calling getRollups", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const queryParamsString = "test";
    await rollupService.getRollups(queryParamsString);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.ROLLUPS}?${queryParamsString}`);
  });

  it("calls put rollup nodejs route when calling putRollup", async () => {
    httpClientMock.put = jest.fn().mockResolvedValue({ data: {} });
    const rollupId = "test_1";
    await rollupService.putRollup(testRollup.rollup, rollupId);

    expect(httpClientMock.put).toHaveBeenCalledTimes(1);
    expect(httpClientMock.put).toHaveBeenCalledWith(`..${NODE_API.ROLLUPS}/${rollupId}`, testRollup.rollup);
  });

  it("calls delete rollup nodejs route when calling deleteRollup", async () => {
    httpClientMock.delete = jest.fn().mockResolvedValue({ data: {} });
    const rollupId = "rollup_id";
    await rollupService.deleteRollup(rollupId);

    expect(httpClientMock.delete).toHaveBeenCalledTimes(1);
    expect(httpClientMock.delete).toHaveBeenCalledWith(`..${NODE_API.ROLLUPS}/${rollupId}`);
  });

  it("calls start rollup nodejs route when calling startRollup", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const rollupId = "rollup_id";
    await rollupService.startRollup(rollupId);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.ROLLUPS}/${rollupId}/_start`, "");
  });

  it("calls stop rollup nodejs route when calling stopRollup", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const rollupId = "rollup_id";
    await rollupService.stopRollup(rollupId);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API.ROLLUPS}/${rollupId}/_stop`, "");
  });

  it("calls get mappings nodejs route when calling getMappings", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: {} });
    const indexName = "index_1";
    await rollupService.getMappings(indexName);

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    expect(httpClientMock.post).toHaveBeenCalledWith(`..${NODE_API._MAPPINGS}`, { index: indexName });
  });

  it("calls explain rollup nodejs route when calling explainRollup", async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({ data: {} });
    const rollupId = "rollup_id";
    await rollupService.explainRollup(rollupId);

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(httpClientMock.get).toHaveBeenCalledWith(`..${NODE_API.ROLLUPS}/${rollupId}/_explain`);
  });
});
