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
import chrome from "ui/chrome";
import { toastNotifications } from "ui/notify";
import { render, wait } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router";
import { browserServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import Rollups from "./Rollups";
import { TEXT } from "../../components/RollupEmptyPrompt/RollupEmptyPrompt";
import { testRollup, testRollup2 } from "../../../CreateRollup/utils/constants";

function renderRollupsWithRouter() {
  return {
    ...render(
      <Router>
        <ServicesContext.Provider value={browserServicesMock}>
          <ServicesConsumer>
            {(services: BrowserServices | null) =>
              services && (
                <ModalProvider>
                  <ModalRoot services={services} />
                  <Switch>
                    <Route
                      path={ROUTES.ROLLUPS}
                      render={(props: RouteComponentProps) => (
                        <div style={{ padding: "25px 25px" }}>
                          <Rollups {...props} rollupService={services.rollupService} />
                        </div>
                      )}
                    />
                    <Route path={ROUTES.CREATE_ROLLUP} render={(props) => <div>Testing create rollup</div>} />
                    <Route path={ROUTES.EDIT_ROLLUP} render={(props) => <div>Testing edit rollup: {props.location.search}</div>} />
                    <Route path={ROUTES.ROLLUP_DETAILS} render={(props) => <div>Testing rollup details: {props.location.search}</div>} />
                    <Redirect from="/" to={ROUTES.ROLLUPS} />
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

describe("<Rollups /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups: [], totalRollups: 0 },
    });
    const { container } = renderRollupsWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows LOADING on mount", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups: [], totalRollups: 0 },
    });
    const { getByText } = renderRollupsWithRouter();

    getByText(TEXT.LOADING);
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups: [], totalRollups: 0 },
    });
    renderRollupsWithRouter();

    expect(chrome.breadcrumbs.set).toHaveBeenCalledTimes(1);
    expect(chrome.breadcrumbs.set).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
  });

  it("loads rollups", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    const { getByText } = renderRollupsWithRouter();
    await wait();

    await wait(() => getByText(testRollup._id));
  });

  it("adds error toaster when get rollups has error", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    renderRollupsWithRouter();

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("some error");
  });

  it("adds error toaster when get rollups throws error", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockRejectedValue(new Error("rejected error"));
    renderRollupsWithRouter();

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("rejected error");
  });

  it("adds error toaster when explain API has error", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    browserServicesMock.rollupService.explainRollup = jest.fn().mockResolvedValue({
      ok: false,
      error: "some explain API error",
    });
    renderRollupsWithRouter();

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("some explain API error");
  });

  it("adds error toaster when explain throws error", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    browserServicesMock.rollupService.explainRollup = jest.fn().mockRejectedValue(new Error("explain API rejected error"));
    renderRollupsWithRouter();

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("explain API rejected error");
  });

  it("can route to create rollup", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups: [], totalrollups: 0 },
    });
    const { getByText, getByTestId } = renderRollupsWithRouter();

    await wait();

    userEvent.click(getByTestId("createRollupButton"));

    await wait(() => getByText("Testing create rollup"));
  });

  it("can route to edit rollup", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalrollups: 1 },
    });
    const { getByText, getByTestId } = renderRollupsWithRouter();

    await wait(() => getByText(testRollup._id));

    userEvent.click(getByTestId(`checkboxSelectRow-${testRollup._id}`));

    userEvent.click(getByTestId("actionButton"));

    await wait(() => getByTestId("editButton"));

    userEvent.click(getByTestId("editButton"));

    await wait(() => getByText(`Testing edit rollup: ?id=${testRollup._id}`));
  });

  //Cannot edit multiple jobs (P1)

  it("can view details of a rollup job", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    const { getByText } = renderRollupsWithRouter();

    await wait();
    await wait(() => getByText(testRollup._id));

    userEvent.click(getByText(testRollup._id));

    await wait(() => getByText(`Testing rollup details: ?id=${testRollup._id}`));
  });

  it("can enable a rollup job", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    browserServicesMock.rollupService.startRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });
    const { getByText, getByTestId } = renderRollupsWithRouter();

    await wait(() => getByText(testRollup._id));

    expect(getByText("Enable")).toBeDisabled();

    userEvent.click(getByTestId(`checkboxSelectRow-${testRollup._id}`));

    expect(getByText("Enable")).toBeEnabled();

    userEvent.click(getByText("Enable"));

    await wait();

    expect(browserServicesMock.rollupService.startRollup).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith(`${testRollup._id} is enabled`);
  });

  //Cannot enable a job

  it("can disable a rollup job", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalRollups: 1 },
    });
    browserServicesMock.rollupService.stopRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });

    const { getByText, getByTestId } = renderRollupsWithRouter();

    await wait(() => getByText(testRollup._id));

    expect(getByText("Disable")).toBeDisabled();

    userEvent.click(getByTestId(`checkboxSelectRow-${testRollup._id}`));

    expect(getByText("Disable")).toBeEnabled();

    userEvent.click(getByText("Disable"));

    await wait();

    expect(browserServicesMock.rollupService.stopRollup).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith(`${testRollup._id} is disabled`);
  });
});
