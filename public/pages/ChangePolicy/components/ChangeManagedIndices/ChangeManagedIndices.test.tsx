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

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, wait } from "@testing-library/react";
import ChangeManagedIndices from "./ChangeManagedIndices";
import { browserServicesMock } from "../../../../../test/mocks";
import coreServicesMock from "../../../../../test/mocks/coreServicesMock";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<ChangeManagedIndices /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest.fn().mockResolvedValue({ ok: true, response: { hits: { hits: [] } } });
    const { container } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ChangeManagedIndices
          managedIndexService={browserServicesMock.managedIndexService}
          selectedManagedIndices={[]}
          selectedStateFilters={[]}
          onChangeManagedIndices={() => {}}
          onChangeStateFilters={() => {}}
          managedIndicesError=""
        />
      </CoreServicesContext.Provider>
    );

    await wait();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows danger toaster when search fails", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest.fn().mockRejectedValue(new Error("this is an error"));
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ChangeManagedIndices
          managedIndexService={browserServicesMock.managedIndexService}
          selectedManagedIndices={[]}
          selectedStateFilters={[]}
          onChangeManagedIndices={() => {}}
          onChangeStateFilters={() => {}}
          managedIndicesError=""
        />
      </CoreServicesContext.Provider>
    );

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("shows danger toaster when search gracefully fails", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ChangeManagedIndices
          managedIndexService={browserServicesMock.managedIndexService}
          selectedManagedIndices={[]}
          selectedStateFilters={[]}
          onChangeManagedIndices={() => {}}
          onChangeStateFilters={() => {}}
          managedIndicesError=""
        />
      </CoreServicesContext.Provider>
    );

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("shows danger toaster when search fails because of no config index", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValue({ ok: false, error: "[index_not_found_exception]and other stuff" });
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ChangeManagedIndices
          managedIndexService={browserServicesMock.managedIndexService}
          selectedManagedIndices={[]}
          selectedStateFilters={[]}
          onChangeManagedIndices={() => {}}
          onChangeStateFilters={() => {}}
          managedIndicesError=""
        />
      </CoreServicesContext.Provider>
    );

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("You have not created a managed index yet");
  });
});
