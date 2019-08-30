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

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, wait } from "@testing-library/react";
import { toastNotifications } from "ui/notify";
import NewPolicy from "./NewPolicy";
import { browserServicesMock } from "../../../../../test/mocks";
import { Radio } from "../../containers/ChangePolicy/ChangePolicy";

describe("<NewPolicy /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.indexService.searchPolicies = jest.fn().mockResolvedValue({ ok: true, response: { hits: { hits: [] } } });
    const { container } = render(
      <NewPolicy
        indexService={browserServicesMock.indexService}
        selectedPolicies={[]}
        stateRadioIdSelected={Radio.Current}
        stateSelected=""
        onChangePolicy={() => {}}
        onChangeStateRadio={() => {}}
        onStateSelectChange={() => {}}
      />
    );

    await wait();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows danger toaster when search fails", async () => {
    browserServicesMock.indexService.searchPolicies = jest.fn().mockRejectedValue(new Error("this is an error"));
    render(
      <NewPolicy
        indexService={browserServicesMock.indexService}
        selectedPolicies={[]}
        stateRadioIdSelected={Radio.Current}
        stateSelected=""
        onChangePolicy={() => {}}
        onChangeStateRadio={() => {}}
        onStateSelectChange={() => {}}
      />
    );

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("shows danger toaster when search gracefully fails", async () => {
    browserServicesMock.indexService.searchPolicies = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    render(
      <NewPolicy
        indexService={browserServicesMock.indexService}
        selectedPolicies={[]}
        stateRadioIdSelected={Radio.Current}
        stateSelected=""
        onChangePolicy={() => {}}
        onChangeStateRadio={() => {}}
        onStateSelectChange={() => {}}
      />
    );

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("some error");
  });

  it("shows danger toaster when search fails because of no config index", async () => {
    browserServicesMock.indexService.searchPolicies = jest
      .fn()
      .mockResolvedValue({ ok: false, error: "[index_not_found_exception]and other stuff" });
    render(
      <NewPolicy
        indexService={browserServicesMock.indexService}
        selectedPolicies={[]}
        stateRadioIdSelected={Radio.Current}
        stateSelected=""
        onChangePolicy={() => {}}
        onChangeStateRadio={() => {}}
        onStateSelectChange={() => {}}
      />
    );

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("You have not created a policy yet");
  });
});
