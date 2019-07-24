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
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, wait } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import { Redirect, Route, Switch } from "react-router";
import { HashRouter as Router } from "react-router-dom";
import { toastNotifications } from "ui/notify";
import chrome from "ui/chrome";
import { browserServicesMock } from "../../../../../test/mocks";
import Indices from "../../index";
import { TEXT } from "../../components/IndexEmptyPrompt/IndexEmptyPrompt";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { ServicesConsumer, ServicesContext } from "../../../../services/Services";
import { BREADCRUMBS } from "../../../../utils/constants";

jest.mock("ui/notify", () => ({
  toastNotifications: {
    addDanger: jest.fn().mockName("addDanger"),
    addSuccess: jest.fn().mockName("addSuccess"),
  },
}));

jest.mock("ui/chrome", () => ({
  breadcrumbs: (() => {
    const breadcrumbs = () => {};
    // @ts-ignore
    breadcrumbs.set = jest.fn();
    return breadcrumbs;
  })(),
}));

function renderWithRouter(Component: React.ComponentType<any>) {
  return {
    ...render(
      <Router>
        <Switch>
          <Route
            path="/indices"
            render={props => (
              <ServicesContext.Provider value={browserServicesMock}>
                <ModalProvider>
                  <ServicesConsumer>{services => services && <ModalRoot services={services} />}</ServicesConsumer>
                  <ServicesConsumer>{({ indexService }: any) => <Component indexService={indexService} {...props} />}</ServicesConsumer>
                </ModalProvider>
              </ServicesContext.Provider>
            )}
          />
          <Redirect from="/" to="/indices" />
        </Switch>
      </Router>
    ),
  };
}

describe("<Indices /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices: [], totalIndices: 0 } });
    const { container } = renderWithRouter(Indices);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows LOADING on mount", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices: [], totalIndices: 0 } });
    const { getByText } = renderWithRouter(Indices);

    getByText(TEXT.LOADING);
  });

  it("sets breadcrumbs when mounting", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices: [], totalIndices: 0 } });
    renderWithRouter(Indices);

    expect(chrome.breadcrumbs.set).toHaveBeenCalledTimes(1);
    expect(chrome.breadcrumbs.set).toHaveBeenCalledWith([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES]);
  });

  it("loads indices", async () => {
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
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices, totalIndices: 1 } });
    const { debug, getByText } = renderWithRouter(Indices);
    await wait();

    debug();

    await wait(() => getByText("index_1"));
  });

  it("adds error toaster when get indices has error", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    renderWithRouter(Indices);

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("some error");
  });

  it("adds error toaster when get indices throws error", async () => {
    browserServicesMock.indexService.getIndices = jest.fn().mockRejectedValue(new Error("rejected error"));
    renderWithRouter(Indices);

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("rejected error");
  });

  it("can add a policy to an index", async () => {
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
    browserServicesMock.indexService.getIndices = jest.fn().mockResolvedValue({ ok: true, response: { indices, totalIndices: 1 } });
    browserServicesMock.indexService.searchPolicies = jest.fn().mockResolvedValue({ ok: true, response: { policies: ["some_policy"] } });
    const { getByText, getByTestId } = renderWithRouter(Indices);

    await wait(() => getByText("index_1"));

    expect(getByTestId("Add policyButton")).toBeDisabled();

    userEvent.click(getByTestId("checkboxSelectRow-index_1"));

    expect(getByTestId("Add policyButton")).toBeEnabled();

    userEvent.click(getByTestId("Add policyButton"));

    await wait();

    /*
     * TODO: Cannot proceed with this test, throws error
     *   Need to figure out why combo box is complaining
     *   TypeError: Cannot read property 'position' of null
     *   at Object.updatePosition (node_modules/@elastic/eui/lib/components/combo_box/combo_box.js:123:43)
     *   at node_modules/@elastic/eui/lib/components/combo_box/combo_box_options_list/combo_box_options_list.js:106:21
     *   at Timeout.callback [as _onTimeout] (../../kibana/node_modules/jsdom/lib/jsdom/browser/Window.js:592:19)
     * */

    // userEvent.click(getByTestId("comboBoxToggleListButton"));

    // await wait();

    // fireEvent.keyPress(getByTestId("comboBoxSearchInput"), { key: "Down Arrow", code: 40, charCode: 40 });

    // await wait();
  });

  it("sorts/paginates the table", async () => {
    const indices = new Array(40).fill(null).map((_, index) => ({
      "docs.count": index,
      "docs.deleted": 2,
      health: "green",
      index: `index_${index}`,
      pri: "1",
      "pri.store.size": "100KB",
      rep: "0",
      status: "open",
      "store.size": "100KB",
      uuid: "some_uuid",
    }));
    browserServicesMock.indexService.getIndices = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: { indices: indices.slice(0, 20), totalIndices: 40 } })
      .mockResolvedValueOnce({ ok: true, response: { indices: indices.slice(20), totalIndices: 40 } })
      .mockResolvedValueOnce({
        ok: true,
        response: {
          indices: indices.sort((a, b) => a["docs.count"] - b["docs.count"]).slice(0, 20),
          totalIndices: 40,
        },
      });

    browserServicesMock.indexService.searchPolicies = jest.fn().mockResolvedValue({ ok: true, response: { policies: ["some_policy"] } });
    const { getByText, getByTestId, getAllByTestId, queryByText } = renderWithRouter(Indices);

    // should load indices 0-19 on first load
    await wait(() => getByText("index_0"));
    expect(queryByText("index_39")).toBeNull();

    fireEvent.click(getAllByTestId("pagination-button-next")[0]);

    // should load indices 20-39 after clicking next
    await wait(() => getByText("index_39"));
    expect(queryByText("index_0")).toBeNull();

    // @ts-ignore
    fireEvent.click(getByTestId("tableHeaderCell_docs.count_5").firstChild);

    // should load indices 0-19 after clicking sort (defaults to asc) on docs.count
    await wait(() => getByText("index_0"));
    expect(queryByText("index_39")).toBeNull();
  });
});
