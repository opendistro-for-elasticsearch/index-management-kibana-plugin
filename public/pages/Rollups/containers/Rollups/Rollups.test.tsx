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

import { render, wait } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import React from "react";
import { browserServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import Rollups from "./Rollups";
import userEvent from "@testing-library/user-event";
import { TEXT } from "../../components/RollupEmptyPrompt/RollupEmptyPrompt";
import chrome from "ui/chrome";
import { toastNotifications } from "ui/notify";

const testRollup = {
  id: "test",
  seqNo: 9,
  primaryTerm: 1,
  rollup: {
    source_index: "kibana_sample_data_logs",
    target_index: "other-index",
    schedule: {
      interval: {
        start_time: 1602972619850,
        period: 1,
        unit: "Minutes",
      },
    },
    continuous: true,
    description: "This should start soon",
    enabled: true,
    page_size: 1000,
    roles: [],
    metrics: [
      {
        source_field: "total_order_quantity",
        metrics: [
          {
            sum: {},
          },
          {
            avg: {},
          },
        ],
      },
    ],
    dimensions: [
      {
        date_histogram: {
          source_field: "order_date",
          fixed_interval: "1m",
          timezone: "America/Los_Angeles",
        },
      },
      {
        terms: {
          source_field: "message",
        },
      },
      {
        histogram: {
          source_field: "bytes",
          interval: 5,
        },
      },
    ],
  },
};

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
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({ ok: true, response: { rollups: [], totalRollups: 0 } });
    const { getByText } = renderRollupsWithRouter();

    getByText(TEXT.LOADING);
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({ ok: true, response: { rollups: [], totalRollups: 0 } });
    renderRollupsWithRouter();

    expect(chrome.breadcrumbs.set).toHaveBeenCalledTimes(1);
    expect(chrome.breadcrumbs.set).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
  });

  it("loads rollups", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({ ok: true, response: { rollups, totalRollups: 1 } });
    const { getByText } = renderRollupsWithRouter();
    await wait(() => getByText(testRollup.id));
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

  it("can delete a rollup job", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: { rollups, totalRollups: 1 } })
      .mockResolvedValueOnce({ ok: true, response: { rollups: [], totalRollups: 0 } });
    browserServicesMock.rollupService.deleteRollup = jest.fn().mockResolvedValue({ ok: true, response: true });
    const { queryByText, getByText, getByTestId } = renderRollupsWithRouter();

    await wait(() => getByText(testRollup.id));

    expect(getByTestId("DeleteButton")).toBeDisabled();

    userEvent.click(getByTestId(`checkboxSelectRow-${testRollup.id}`));

    expect(getByTestId("DeleteButton")).toBeEnabled();

    userEvent.click(getByTestId("DeleteButton"));
    await wait(() => getByTestId("confirmationModalActionButton"));
    userEvent.click(getByTestId("confirmationModalActionButton"));

    await wait();

    expect(browserServicesMock.policyService.deletePolicy).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith(`Deleted the policy: ${testRollup.id}`);

    await wait(() => expect(queryByText(testRollup.id)).toBeNull());
  });

  it("can route to edit rollup", async () => {
    const rollups = [testRollup];
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({
      ok: true,
      response: { rollups, totalrollups: 1 },
    });
    const { getByText, getByTestId } = renderRollupsWithRouter();

    await wait(() => getByText(testRollup.id));

    expect(getByTestId("EditButton")).toBeDisabled();

    userEvent.click(getByTestId(`checkboxSelectRow-${testRollup.id}`));

    expect(getByTestId("EditButton")).toBeEnabled();

    userEvent.click(getByTestId("EditButton"));

    await wait(() => getByText(`Testing edit rollup: ?id=${testRollup.id}`));
  });

  it("can route to create rollup", async () => {
    browserServicesMock.rollupService.getRollups = jest.fn().mockResolvedValue({ ok: true, response: { rollups: [], totalrollups: 1 } });
    const { getByText, getByTestId } = renderRollupsWithRouter();

    await wait();

    userEvent.click(getByTestId("createRollupButton"));

    await wait(() => getByText("Testing create rollup"));
  });
});
