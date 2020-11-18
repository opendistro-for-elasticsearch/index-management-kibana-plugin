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
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import RollupDetails from "./RollupDetails";
import { testRollup, testRollup2 } from "../../../CreateRollup/utils/constants";
import { ServicesConsumer, ServicesContext } from "../../../../services";

function renderRollupDetailsWithRouter(initialEntries = ["/"]) {
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
                      path={ROUTES.ROLLUP_DETAILS}
                      render={(props: RouteComponentProps) => <RollupDetails {...props} rollupService={services.rollupService} />}
                    />
                    <Route path={ROUTES.EDIT_ROLLUP} render={(props) => <div>Testing edit rollup: {props.location.search}</div>} />
                    <Route path={ROUTES.ROLLUPS} render={(props) => <div>Testing rollup landing page</div>} />
                    <Redirect from="/" to={ROUTES.ROLLUP_DETAILS} />
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

describe("<RollupDetails /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    const { container } = renderRollupDetailsWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    expect(chrome.breadcrumbs.set).toHaveBeenCalledTimes(1);
    expect(chrome.breadcrumbs.set).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS, { text: testRollup._id }]);
  });

  it("adds error toaster when get rollup has error", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByText } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("some error");

    await wait(() => getByText("Testing rollup landing page"));
  });

  it("adds error toaster when get rollup throws error", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockRejectedValue(new Error("rejected error"));
    const { getByText } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("rejected error");
    await wait(() => getByText("Testing rollup landing page"));
  });

  it("adds error toaster when explain API has error", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    browserServicesMock.rollupService.explainRollup = jest.fn().mockResolvedValue({
      ok: false,
      error: "some explain API error",
    });
    renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("Could not load the explain API of rollup job: some explain API error");
  });

  it("adds error toaster when explain throws error", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    browserServicesMock.rollupService.explainRollup = jest.fn().mockRejectedValue(new Error("explain API rejected error"));
    renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("explain API rejected error");
  });

  it("can disable rollup job", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    browserServicesMock.rollupService.stopRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });
    const { getByTestId } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup._id}`]);
    expect(getByTestId("disableButton")).toBeEnabled();

    userEvent.click(getByTestId("disableButton"));

    await wait();

    expect(browserServicesMock.rollupService.stopRollup).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith(`${testRollup._id} is disabled`);
  });

  it("can enable rollup job", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup2,
    });
    browserServicesMock.rollupService.startRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: true,
    });
    const { getByTestId } = renderRollupDetailsWithRouter([`${ROUTES.ROLLUP_DETAILS}?id=${testRollup2._id}`]);
    expect(getByTestId("enableButton")).toBeEnabled();

    userEvent.click(getByTestId("enableButton"));

    await wait();

    expect(browserServicesMock.rollupService.startRollup).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith(`${testRollup2._id} is enabled`);
  });
});
