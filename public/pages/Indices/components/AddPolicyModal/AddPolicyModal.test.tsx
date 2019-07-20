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
import AddPolicyModal from "./AddPolicyModal";
import { browserServicesMock, httpClientMock } from "../../../../../test/mocks";

jest.mock("ui/notify", () => ({
  toastNotifications: {
    addDanger: jest.fn().mockName("addDanger"),
    addSuccess: jest.fn().mockName("addSuccess"),
  },
}));

// TODO: fireEvent for addPolicy, but need to figure out how to get react-testing-library to work
//  with the combo_box in modal

describe("<AddPolicyModal /> spec", () => {
  it("renders the component", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: { ok: true, resp: { hits: { hits: [{ _id: "test_index" }] } } } });
    render(<AddPolicyModal onClose={() => {}} services={browserServicesMock} indices={[]} />);

    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("successfully calls search policies on mount", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: { ok: true, resp: { hits: { hits: [{ _id: "test_index" }] } } } });
    const spy = jest.spyOn(browserServicesMock.indexService, "searchPolicies");
    render(<AddPolicyModal onClose={() => {}} services={browserServicesMock} indices={[]} />);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");
    expect(toastNotifications.addDanger).not.toHaveBeenCalled();
  });

  it("adds danger toaster on safe error", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ data: { ok: false, error: "some error" } });
    const spy = jest.spyOn(browserServicesMock.indexService, "searchPolicies");
    render(<AddPolicyModal onClose={() => {}} services={browserServicesMock} indices={[]} />);

    // wait 1 tick for the searchPolicies promise to resolve
    await wait();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");
    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("some error");
  });

  it("adds danger toaster on unsafe error", async () => {
    httpClientMock.post = jest.fn().mockRejectedValue(new Error("testing error"));
    const spy = jest.spyOn(browserServicesMock.indexService, "searchPolicies");
    render(<AddPolicyModal onClose={() => {}} services={browserServicesMock} indices={[]} />);

    // wait 1 tick for the searchPolicies promise to resolve
    await wait();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("");
    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("testing error");
  });
});
