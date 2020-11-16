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

import { render, wait } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import React from "react";
import { browserServicesMock } from "../../../../../test/mocks";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import rollups from "../../../rollups/containers/rollups";
import Rollups from "./Rollups";
import userEvent from "@testing-library/user-event";

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
          timezone: "UTC+7",
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
