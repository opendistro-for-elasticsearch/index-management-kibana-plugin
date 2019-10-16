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
import { ROUTES } from "../../../../utils/constants";

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
                      path={ROUTES.CREATE_POLICY}
                      render={(props: RouteComponentProps) => (
                        <CreatePolicy {...props} isEdit={false} policyService={services.policyService} />
                      )}
                    />
                    <Route
                      path={ROUTES.EDIT_POLICY}
                      render={(props: RouteComponentProps) => (
                        <CreatePolicy {...props} isEdit={true} policyService={services.policyService} />
                      )}
                    />
                    <Route path={ROUTES.INDEX_POLICIES} render={(props: RouteComponentProps) => <div>Testing Policies</div>} />
                    <Redirect from="/" to={ROUTES.CREATE_POLICY} />
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
    const { container } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy`]);

    await wait();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("routes back to policies if given bad id", async () => {
    const { getByText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=one&id=two`]);

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("Invalid policy id: one,two");
  });

  it("routes back to policies if getPolicy gracefully fails", async () => {
    browserServicesMock.policyService.getPolicy = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_id`]);

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("Could not load the policy: some error");
  });

  it("routes back to policies if getPolicy gracefully fails", async () => {
    browserServicesMock.policyService.getPolicy = jest.fn().mockRejectedValue(new Error("another error"));
    const { getByText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_id`]);

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("another error");
  });

  it("disallows editing policy ID when in edit", async () => {
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByDisplayValue, getByPlaceholderText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_id`]);

    await wait(() => getByDisplayValue("some_id"));

    expect(getByPlaceholderText("hot_cold_workflow")).toHaveAttribute("readonly");
  });

  it("shows error for policyId input when clicking create", async () => {
    const { getByTestId, queryByText, getByPlaceholderText } = renderCreatePolicyWithRouter();

    expect(queryByText("Required")).toBeNull();

    userEvent.click(getByTestId("createPolicyCreateButton"));

    expect(queryByText("Required")).not.toBeNull();

    fireEvent.focus(getByPlaceholderText("hot_cold_workflow"));
    userEvent.type(getByPlaceholderText("hot_cold_workflow"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("hot_cold_workflow"));

    expect(queryByText("Required")).toBeNull();
  });

  it("routes you back to policies and shows a success toaster when successfully creating a policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: true, response: { _id: "some_policy_id" } });
    const { getByText, getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("hot_cold_workflow"));
    userEvent.type(getByPlaceholderText("hot_cold_workflow"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("hot_cold_workflow"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith("Created policy: some_policy_id");
  });

  it("shows a danger toaster when getting graceful error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: false, error: "bad policy" });
    const { getByText, getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("hot_cold_workflow"));
    userEvent.type(getByPlaceholderText("hot_cold_workflow"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("hot_cold_workflow"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait(() => getByText("bad policy"));
  });

  it("shows a danger toaster when getting error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
    const { getByText, getByTestId, getByPlaceholderText } = renderCreatePolicyWithRouter();

    fireEvent.focus(getByPlaceholderText("hot_cold_workflow"));
    userEvent.type(getByPlaceholderText("hot_cold_workflow"), `some_policy_id`);
    fireEvent.blur(getByPlaceholderText("hot_cold_workflow"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait(() => getByText("this is an error"));
  });

  it("routes you back to policies and shows a success toaster when successfully updating a policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: true, response: { _id: "some_policy_id" } });
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByText, getByTestId, getByDisplayValue } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

    await wait(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait(() => getByText("Testing Policies"));
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith("Updated policy: some_policy_id");
  });

  it("shows error when getting graceful error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockResolvedValue({ ok: false, error: "bad policy" });
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByTestId, getByDisplayValue, getByText } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

    await wait(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait(() => getByText("bad policy"));
  });

  it("shows a danger toaster when getting error from create policy", async () => {
    browserServicesMock.policyService.putPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
    browserServicesMock.policyService.getPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { seqNo: 1, primaryTerm: 5, id: "some_policy_id", policy: JSON.parse(DEFAULT_POLICY) } });
    const { getByText, getByTestId, getByDisplayValue } = renderCreatePolicyWithRouter([`${ROUTES.EDIT_POLICY}?id=some_policy_id`]);

    await wait(() => getByDisplayValue("some_policy_id"));

    userEvent.click(getByTestId("createPolicyCreateButton"));

    await wait(() => getByText("this is an error"));
  });

  it("brings you back to policies when clicking cancel", async () => {
    const { getByTestId, getByText } = renderCreatePolicyWithRouter();

    userEvent.click(getByTestId("createPolicyCancelButton"));

    await wait(() => getByText("Testing Policies"));
  });
});
