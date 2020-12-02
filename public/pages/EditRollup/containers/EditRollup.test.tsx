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
import { fireEvent, render, wait } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import EditRollup from "./EditRollup";
import { browserServicesMock, coreServicesMock } from "../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../services";
import { ModalProvider, ModalRoot } from "../../../components/Modal";
import { BrowserServices } from "../../../models/interfaces";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { testRollup } from "../../../../test/constants";
import { CoreServicesContext } from "../../../components/core_services";

function renderEditRollupWithRouter(initialEntries = ["/"]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <ModalProvider>
                    <ModalRoot services={services} />
                    <Switch>
                      <Route
                        path={ROUTES.EDIT_ROLLUP}
                        render={(props: RouteComponentProps) => <EditRollup {...props} rollupService={services.rollupService} />}
                      />
                      <Route path={ROUTES.ROLLUPS} render={(props) => <div>Testing rollup landing page</div>} />
                      <Redirect from="/" to={ROUTES.EDIT_ROLLUP} />
                    </Switch>
                  </ModalProvider>
                )
              }
            </ServicesConsumer>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<EditRollup /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    const { container } = renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.ROLLUPS,
      BREADCRUMBS.EDIT_ROLLUP,
      { text: testRollup._id },
    ]);
  });

  it("adds error toaster when get rollup has error", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByText } = renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Could not load the rollup job: some error");

    await wait(() => getByText("Testing rollup landing page"));
  });

  it("adds error toaster when get rollup throws error", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockRejectedValue(new Error("rejected error"));
    const { getByText } = renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("rejected error");
    await wait(() => getByText("Testing rollup landing page"));
  });

  it("can edit description", async () => {
    browserServicesMock.rollupService.getRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });

    browserServicesMock.rollupService.putRollup = jest.fn().mockResolvedValue({
      ok: true,
      response: testRollup,
    });
    const { getByTestId } = renderEditRollupWithRouter([`${ROUTES.EDIT_ROLLUP}?id=${testRollup._id}`]);

    await wait();

    fireEvent.focus(getByTestId("description"));
    await userEvent.type(getByTestId("description"), "some description");
    fireEvent.blur(getByTestId("description"));

    //TODO: Verify changes are saved.
  });
});
