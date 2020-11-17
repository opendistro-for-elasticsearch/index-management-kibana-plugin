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
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { MemoryRouter as Router } from "react-router";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import CreateRollupForm from "./CreateRollupForm";
import chrome from "ui/chrome";
import userEvent from "@testing-library/user-event";

function renderCreateRollupFormWithRouter() {
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
                      path={ROUTES.CREATE_ROLLUP}
                      render={(props: RouteComponentProps) => (
                        <div style={{ padding: "25px 25px" }}>
                          <CreateRollupForm {...props} rollupService={services.rollupService} indexService={services.indexService} />
                        </div>
                      )}
                    />
                    <Route path={ROUTES.ROLLUPS} render={(props) => <div>Testing rollup landing page</div>} />
                    <Redirect from="/" to={ROUTES.CREATE_ROLLUP} />
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

describe("<CreateRollupForm /> spec", () => {
  it("renders the component", async () => {
    const { container } = renderCreateRollupFormWithRouter();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    renderCreateRollupFormWithRouter();

    expect(chrome.breadcrumbs.set).toHaveBeenCalledTimes(4);
    expect(chrome.breadcrumbs.set).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS, BREADCRUMBS.CREATE_ROLLUP]);
  });

  it("routes back to rollup landing page if cancelled", async () => {
    const { getByTestId, getByText } = renderCreateRollupFormWithRouter();

    expect(getByTestId("createRollupCancelButton")).toBeEnabled();

    userEvent.click(getByTestId("createRollupCancelButton"));

    await wait(() => getByText("Testing rollup landing page"));
  });

  it("will show error on step 1", async () => {
    const { getByTestId, queryByText } = renderCreateRollupFormWithRouter();

    expect(getByTestId("createRollupNextButton")).toBeEnabled();

    userEvent.click(getByTestId("createRollupNextButton"));

    expect(queryByText("Job name is required.")).not.toBeNull();

    expect(queryByText("Source index is required.")).not.toBeNull();

    expect(queryByText("Target index is required.")).not.toBeNull();
  });

  it("routes from step 1 to step 2", async () => {
    const { getByTestId, getByLabelText, getByDisplayValue, queryByText, getByPlaceholderText } = renderCreateRollupFormWithRouter();
    const indices = [
      {
        "docs.count": 5,
        "docs.deleted": 2,
        health: "green",
        index: "index_1",
        pri: "1",
        "pri.store.size": "100KB",
        rep: "0",
        status: "open",
        "store.size": "100KB",
        uuid: "some_uuid",
      },
    ];

    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({
      ok: true,
      response: { indices, totalIndices: 1 },
    });

    fireEvent.focus(getByLabelText("Name"));
    userEvent.type(getByLabelText("Name"), "some_rollup_id");
    fireEvent.blur(getByLabelText("Name"));

    fireEvent.focus(getByTestId("description"));
    userEvent.type(getByTestId("description"), "some description");
    fireEvent.blur(getByTestId("description"));

    fireEvent.focus(getByLabelText("Source index"));
    userEvent.type(getByLabelText("Source index"), "index_1");
    userEvent.click(getByDisplayValue("index_1"));
    fireEvent.blur(getByLabelText("Source index"));

    fireEvent.focus(getByLabelText("Target index"));
    userEvent.type(getByLabelText("Target index"), "some_target_index");
    fireEvent.keyPress(getByLabelText("Target index"), { key: "Enter", code: "Enter" });
    fireEvent.blur(getByLabelText("Target index"));

    expect(queryByText("Job name is required.")).toBeNull();

    expect(queryByText("Source index is required.")).toBeNull();

    expect(queryByText("Target index is required.")).toBeNull();

    expect(getByTestId("createRollupNextButton")).toBeEnabled();

    userEvent.click(getByTestId("createRollupNextButton"));
    getByLabelText("fake");

    await wait(() => getByLabelText("Timestamp field"));
  });
});
