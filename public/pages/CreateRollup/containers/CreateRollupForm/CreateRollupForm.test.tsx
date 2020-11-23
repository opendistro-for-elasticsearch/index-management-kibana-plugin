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

const sampleMapping = {
  index_1: {
    mappings: {
      properties: {
        category: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },
        customer_gender: {
          type: "keyword",
        },
        day_of_week: {
          type: "keyword",
        },
        day_of_week_i: {
          type: "integer",
        },
        geoip: {
          properties: {
            city_name: {
              type: "keyword",
            },
            region_name: {
              type: "keyword",
            },
          },
        },
        order_date: {
          type: "date",
        },
        products: {
          properties: {
            _id: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                  ignore_above: 256,
                },
              },
            },
            category: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            price: {
              type: "half_float",
            },
            quantity: {
              type: "integer",
            },
            tax_amount: {
              type: "half_float",
            },
            taxful_price: {
              type: "half_float",
            },
            taxless_price: {
              type: "half_float",
            },
          },
        },
        taxful_total_price: {
          type: "half_float",
        },
        taxless_total_price: {
          type: "half_float",
        },
        total_quantity: {
          type: "integer",
        },
        type: {
          type: "keyword",
        },
        user: {
          type: "keyword",
        },
      },
    },
  },
};

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

    browserServicesMock.rollupService.getMappings = jest.fn().mockResolvedValue({
      ok: true,
      response: sampleMapping,
    });
    const { getByTestId, getByLabelText, queryByText, getAllByTestId } = renderCreateRollupFormWithRouter();

    fireEvent.focus(getByLabelText("Name"));
    await userEvent.type(getByLabelText("Name"), "some_rollup_id");
    fireEvent.blur(getByLabelText("Name"));

    fireEvent.focus(getByTestId("description"));
    await userEvent.type(getByTestId("description"), "some description");
    fireEvent.blur(getByTestId("description"));

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index_1");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[1], "some_target_index");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "Enter", code: "Enter" });

    userEvent.click(getByTestId("createRollupNextButton"));

    expect(queryByText("Job name is required.")).toBeNull();

    expect(queryByText("Source index is required.")).toBeNull();

    expect(queryByText("Target index is required.")).toBeNull();

    //Check that it routes to step 2
    expect(queryByText("Timestamp field")).not.toBeNull();
  });

  it("routes from step 1 to step 3", async () => {
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

    browserServicesMock.rollupService.getMappings = jest.fn().mockResolvedValue({
      ok: true,
      response: sampleMapping,
    });

    const {
      debug,
      getByTestId,
      getByLabelText,
      queryByText,
      getAllByTestId,
      getByDisplayValue,
      getByText,
    } = renderCreateRollupFormWithRouter();

    fireEvent.focus(getByLabelText("Name"));
    await userEvent.type(getByLabelText("Name"), "some_rollup_id");
    fireEvent.blur(getByLabelText("Name"));

    fireEvent.focus(getByTestId("description"));
    await userEvent.type(getByTestId("description"), "some description");
    fireEvent.blur(getByTestId("description"));

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[0], "index_1");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[0], { key: "Enter", code: "Enter" });

    await userEvent.type(getAllByTestId("comboBoxSearchInput")[1], "some_target_index");
    fireEvent.keyDown(getAllByTestId("comboBoxSearchInput")[1], { key: "Enter", code: "Enter" });

    userEvent.click(getByTestId("createRollupNextButton"));

    expect(queryByText("Job name is required.")).toBeNull();

    expect(queryByText("Source index is required.")).toBeNull();

    expect(queryByText("Target index is required.")).toBeNull();

    //Check that it routes to step 2
    expect(queryByText("Timestamp field")).not.toBeNull();

    //Select timestamp
    await userEvent.type(getByTestId("comboBoxSearchInput"), "order_date");
    await wait();
    fireEvent.keyDown(getByTestId("comboBoxSearchInput"), { key: "Enter", code: "Enter" });
    fireEvent.blur(getByTestId("comboBoxSearchInput"));

    //Test calendar interval
    userEvent.click(getByLabelText("Calendar"));
    expect(queryByText("Every 1")).not.toBeNull();

    //Test change interval
    userEvent.click(getByDisplayValue("Hour"));
    await wait(() => getByText("Week"));
    userEvent.click(getByText("Week"));

    //Test change timezone
    userEvent.click(getByLabelText("Timezone"));
    await wait(() => getByText("America/Los_Angeles"));
    userEvent.click(getByText("America/Los_Angeles"));

    //Test add aggregation
    userEvent.dblClick(getByTestId("addFieldsAggregation"));
    userEvent.click(getByTestId("checkboxSelectRow-day_of_week_i"));
    userEvent.click(getByTestId("checkboxSelectRow-day_of_week"));
    userEvent.click(getByText("Add"));

    userEvent.dblClick(getByTestId("addFieldsAggregation"));
    userEvent.click(getByTestId("addFieldsAggregationCancel"));

    //Test add metric
    userEvent.dblClick(getByTestId("addFieldsMetric"));
    userEvent.click(getByTestId("checkboxSelectAll"));
    userEvent.click(getByText("Add"));
    debug();

    userEvent.click(getByText("Enable all"));
    userEvent.click(getByTestId("enable_min"));

    userEvent.click(getByTestId("all-day_of_week_i"));

    userEvent.click(getByText("Disable all"));
    userEvent.click(getByTestId("disable_max"));

    userEvent.click(getByTestId("createRollupNextButton"));
    expect(queryByText("Timestamp is required.")).toBeNull();

    // expect(queryByText("Must specify at least one metric to aggregate on for:")).not.toBeNull();

    //Check that it routes to step 3
    expect(queryByText("Enable job by default")).not.toBeNull();
  });
});
