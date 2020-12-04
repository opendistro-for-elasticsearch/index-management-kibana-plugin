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
import { Redirect, Route, Switch } from "react-router-dom";
import { HashRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, wait } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoreStart } from "kibana/public";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import ManagedIndices from "./ManagedIndices";
import { TEXT } from "../../components/ManagedIndexEmptyPrompt/ManagedIndexEmptyPrompt";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { ManagedIndexItem } from "../../../../../models/interfaces";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";

function renderWithRouter(Component: React.ComponentType<any>) {
  return {
    ...render(
      <Router>
        <Switch>
          <Route
            path={ROUTES.MANAGED_INDICES}
            render={(props) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <ServicesContext.Provider value={browserServicesMock}>
                  <ModalProvider>
                    <ServicesConsumer>{(services) => services && <ModalRoot services={services} />}</ServicesConsumer>
                    <CoreServicesConsumer>
                      {(core: CoreStart | null) => (
                        <ServicesConsumer>
                          {({ managedIndexService }: any) => <Component managedIndexService={managedIndexService} {...props} />}
                        </ServicesConsumer>
                      )}
                    </CoreServicesConsumer>
                  </ModalProvider>
                </ServicesContext.Provider>
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to={ROUTES.MANAGED_INDICES} />
        </Switch>
      </Router>
    ),
  };
}

describe("<ManagedIndices /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { managedIndices: [], totalManagedIndices: 0 } });
    const { container } = renderWithRouter(ManagedIndices);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows LOADING on mount", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { managedIndices: [], totalManagedIndices: 0 } });
    const { getByText } = renderWithRouter(ManagedIndices);

    getByText(TEXT.LOADING);
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { managedIndices: [], totalManagedIndices: 0 } });
    renderWithRouter(ManagedIndices);

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.MANAGED_INDICES]);
  });

  it("loads managed indices", async () => {
    const managedIndices = [
      {
        index: "index_1",
        indexUuid: "index_1_uuid",
        policyId: "some_policy",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: null,
        enabled: true,
        managedIndexMetaData: null,
      },
    ];
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { managedIndices, totalManagedIndices: 1 } });
    const { getByText } = renderWithRouter(ManagedIndices);
    await wait();

    await wait(() => getByText("index_1"));
  });

  it("adds error toaster when get managed indices has error", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    renderWithRouter(ManagedIndices);

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("adds error toaster when get managed indices throws error", async () => {
    browserServicesMock.managedIndexService.getManagedIndices = jest.fn().mockRejectedValue(new Error("rejected error"));
    renderWithRouter(ManagedIndices);

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("rejected error");
  });

  it("can remove a policy from a managed index", async () => {
    const managedIndices = [
      {
        index: "index_1",
        indexUuid: "index_1_uuid",
        policyId: "some_policy",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: null,
        enabled: true,
        managedIndexMetaData: null,
      },
    ];
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { managedIndices, totalManagedIndices: 1 } });
    browserServicesMock.managedIndexService.removePolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { updatedIndices: 1, failures: false, failedIndices: [] } });
    const { getByText, getByTestId } = renderWithRouter(ManagedIndices);

    await wait(() => getByText("index_1"));

    expect(getByTestId("Remove policyButton")).toBeDisabled();

    userEvent.click(getByTestId("checkboxSelectRow-index_1"));

    expect(getByTestId("Remove policyButton")).toBeEnabled();

    userEvent.click(getByTestId("Remove policyButton"));
    await wait(() => getByTestId("confirmationModalActionButton"));
    userEvent.click(getByTestId("confirmationModalActionButton"));
    await wait();

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Removed policy from 1 managed indices");
  });

  it("sorts/paginates the table", async () => {
    const managedIndices = new Array(40).fill(null).map((_, index) => ({
      index: `index_${index}`,
      indexUuid: `index_${index}_uuid`,
      policyId: "some_policy",
      policySeqNo: 1,
      policyPrimaryTerm: 1,
      policy: null,
      enabled: true,
      managedIndexMetaData: null,
    }));
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: { managedIndices: managedIndices.slice(0, 20), totalManagedIndices: 40 } })
      .mockResolvedValueOnce({ ok: true, response: { managedIndices: managedIndices.slice(20), totalManagedIndices: 40 } })
      .mockResolvedValueOnce({
        ok: true,
        response: {
          managedIndices: managedIndices.sort().slice(0, 20),
          totalManagedIndices: 40,
        },
      });

    const { getByText, getByTestId, getAllByTestId, queryByText } = renderWithRouter(ManagedIndices);

    // should load managed indices 0-19 on first load
    await wait(() => getByText("index_0"));
    expect(queryByText("index_39")).toBeNull();

    fireEvent.click(getAllByTestId("pagination-button-next")[0]);

    // should load managed indices 20-39 after clicking next
    await wait(() => getByText("index_39"));
    expect(queryByText("index_0")).toBeNull();

    // @ts-ignore
    fireEvent.click(getByTestId("tableHeaderCell_index_0").firstChild);

    // should load managed indices 0-19 after clicking sort (defaults to asc) on index
    await wait(() => getByText("index_0"));
    expect(queryByText("index_39")).toBeNull();
  });

  it("retry disables/enables itself when selecting a failed/non-failed managed indices", async () => {
    const managedIndices: ManagedIndexItem[] = [
      {
        index: "index_1",
        indexUuid: "index_1_uuid",
        policyId: "some_policy",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: {
          description: "some description",
          default_state: "two",
          states: [
            { name: "two", actions: [{ delete: {} }], transitions: [] },
            { name: "three", actions: [{ delete: {} }], transitions: [] },
          ],
        },
        enabled: true,
        managedIndexMetaData: {
          index: "index_1",
          indexUuid: "index_1_uuid",
          policyId: "some_policy",
          policyPrimaryTerm: 1,
          policySeqNo: 1,
          state: { name: "two", startTime: Date.now() },
          retryInfo: { failed: false, consumedRetries: 0 },
        },
      },
      {
        index: "index_2",
        indexUuid: "index_2_uuid",
        policyId: "some_policy",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: {
          description: "some description",
          default_state: "two",
          states: [
            { name: "two", actions: [{ delete: {} }], transitions: [] },
            { name: "three", actions: [{ delete: {} }], transitions: [] },
          ],
        },
        enabled: false,
        managedIndexMetaData: {
          index: "index_2",
          indexUuid: "index_2_uuid",
          policyId: "some_policy",
          policyPrimaryTerm: 1,
          policySeqNo: 1,
          state: { name: "two", startTime: Date.now() },
          retryInfo: { failed: true, consumedRetries: 0 },
        },
      },
    ];
    browserServicesMock.managedIndexService.getManagedIndices = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: { managedIndices: managedIndices, totalManagedIndices: 2 } });

    const { getByText, getByTestId } = renderWithRouter(ManagedIndices);

    await wait(() => getByText("index_1"));

    expect(getByTestId("Retry policyButton")).toBeDisabled();

    userEvent.click(getByTestId("checkboxSelectRow-index_2"));

    expect(getByTestId("Retry policyButton")).toBeEnabled();

    userEvent.click(getByTestId("checkboxSelectRow-index_1"));

    expect(getByTestId("Retry policyButton")).toBeDisabled();
  });
});
