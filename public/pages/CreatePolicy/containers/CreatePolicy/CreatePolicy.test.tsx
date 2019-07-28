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
import { render, wait, fireEvent } from "@testing-library/react";
import CreatePolicy from "./CreatePolicy";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { MemoryRouter as Router, Redirect, Route, RouteComponentProps, Switch } from "react-router";
import { browserServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { DEFAULT_POLICY } from "../../utils/constants";
import userEvent from "@testing-library/user-event";
import { toastNotifications } from "ui/notify";

jest.mock("../../components/DefinePolicy", () => require("../../components/DefinePolicy/__mocks__/DefinePolicyMock"));

function renderCreatePolicyWithRouter(initialEntries = ["/"]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ServicesConsumer>
            {(services: BrowserServices | null) =>
              services && (
                <ModalProvider>
                  <ModalRoot services={services} />
                  <Switch>
                    <Route
                      path="/create-policy"
                      render={(props: RouteComponentProps) => (
                        <CreatePolicy {...props} isEdit={false} policyService={services.policyService} />
                      )}
                    />
                    <Route
                      path="/edit-policy"
                      render={(props: RouteComponentProps) => (
                        <CreatePolicy {...props} isEdit={true} policyService={services.policyService} />
                      )}
                    />
                    <Route path="/policies" render={(props: RouteComponentProps) => <div>Testing Policies</div>} />
                    <Redirect from="/" to="/create-policy" />
                  </Switch>
                </ModalProvider>
              )
            }
          </ServicesConsumer>
        </ServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<CreatePolicy /> spec", () => {
  it("renders the create component", () => {
    const { container } = renderCreatePolicyWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders the edit component", async () => {
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy", policy: JSON.parse(DEFAULT_POLICY) } });
    const { container } = renderCreatePolicyWithRouter(["/edit-policy?id=some_policy"]);

    await wait();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("routes back to policies if given bad id", async () => {
    const { getByText } = renderCreatePolicyWithRouter(["/edit-policy?id=one&id=two"]);

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("Invalid policy id: one,two");
  });

  it("routes back to policies if getPolicy gracefully fails", async () => {
    browserServicesMock.policyService.getPolicy = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByText } = renderCreatePolicyWithRouter(["/edit-policy?id=some_id"]);

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("Could not load the policy: some error");
  });

  it("routes back to policies if getPolicy gracefully fails", async () => {
    browserServicesMock.policyService.getPolicy = jest.fn().mockRejectedValue(new Error("another error"));
    const { getByText } = renderCreatePolicyWithRouter(["/edit-policy?id=some_id"]);

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("another error");
  });

  it("disables create/update when no policy id", async () => {
    const { getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    expect(getByTestId("createPolicyCreateButton")).toBeDisabled();

    userEvent.type(getByPlaceholderText("Policy ID"), `some_policy_id`);

    expect(getByTestId("createPolicyCreateButton")).toBeEnabled();

    userEvent.type(getByPlaceholderText("Policy ID"), ``, { allAtOnce: true });

    expect(getByTestId("createPolicyCreateButton")).toBeDisabled();
  });

  it("disables create/update when invalid JSON", async () => {
    const { getByTestId, getByPlaceholderText, getByLabelText } = renderCreatePolicyWithRouter();

    userEvent.type(getByPlaceholderText("Policy ID"), `some_policy_id`);

    // The initial DEFAULT_POLICY is valid, and we now have a valid policy id
    expect(getByTestId("createPolicyCreateButton")).toBeEnabled();

    userEvent.type(getByLabelText("Code Editor"), `{ "bad_json": { }`);

    expect(getByTestId("createPolicyCreateButton")).toBeDisabled();
  });

  it("disallows editing policy ID when in edit", async () => {
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByDisplayValue, getByPlaceholderText } = renderCreatePolicyWithRouter(["/edit-policy?id=some_id"]);

    await wait(() => getByDisplayValue("some_id"));

    expect(getByPlaceholderText("Policy ID")).toHaveAttribute("readonly");
  });

  it("shows error for policyId input when toggling focus/bur", async () => {
    const { queryByText, getByPlaceholderText } = renderCreatePolicyWithRouter();

    expect(queryByText("Required")).toBeNull();
    fireEvent.focus(getByPlaceholderText("Policy ID"));

    fireEvent.blur(getByPlaceholderText("Policy ID"));

    expect(queryByText("Required")).not.toBeNull();

    fireEvent.focus(getByPlaceholderText("Policy ID"));

    expect(queryByText("Required")).toBeNull();

    userEvent.type(getByPlaceholderText("Policy ID"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("Policy ID"));

    expect(queryByText("Required")).toBeNull();
  });

  it("routes you back to policies and shows a success toaster when successfully creating a policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: true, response: { _id: "some_policy_id" } });
    const { getByText, getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("Policy ID"));
    userEvent.type(getByPlaceholderText("Policy ID"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("Policy ID"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith("Created policy: some_policy_id");
  });

  it("shows a danger toaster when getting graceful error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: false, error: "bad policy" });
    const { getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("Policy ID"));
    userEvent.type(getByPlaceholderText("Policy ID"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("Policy ID"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait();
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("Failed to create policy: bad policy");
  });

  it("shows a danger toaster when getting error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
    const { getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("Policy ID"));
    userEvent.type(getByPlaceholderText("Policy ID"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("Policy ID"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait();
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("routes you back to policies and shows a success toaster when successfully updating a policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: true, response: { _id: "some_policy_id" } });
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByText, getByTestId, getByDisplayValue } = renderCreatePolicyWithRouter(["/edit-policy?id=some_policy_id"]);

    await wait(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith("Updated policy: some_policy_id");
  });

  it("shows a danger toaster when getting graceful error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: false, error: "bad policy" });
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByTestId, getByDisplayValue } = renderCreatePolicyWithRouter(["/edit-policy?id=some_policy_id"]);

    await wait(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait();
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("Failed to update policy: bad policy");
  });

  it("shows a danger toaster when getting error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByTestId, getByDisplayValue } = renderCreatePolicyWithRouter(["/edit-policy?id=some_policy_id"]);

    await wait(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait();
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("brings you back to policies when clicking cancel", async () => {
    const { getByTestId, getByText } = renderCreatePolicyWithRouter();

    userEvent.click(getByTestId("createPolicyCancelButton"));

    await wait(() => getByText("Testing Policies"));
  });
});
