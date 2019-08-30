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
import { render, wait } from "@testing-library/react";
import chrome from "ui/chrome";
import { HashRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import ChangePolicy from "./ChangePolicy";
import { browserServicesMock } from "../../../../../test/mocks";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";

function renderWithRouter(Component: React.ComponentType<any>) {
  return {
    ...render(
      <Router>
        <Switch>
          <Route
            path={ROUTES.CHANGE_POLICY}
            render={props => (
              <ServicesContext.Provider value={browserServicesMock}>
                <ModalProvider>
                  <ServicesConsumer>{services => services && <ModalRoot services={services} />}</ServicesConsumer>
                  <ServicesConsumer>
                    {({ managedIndexService, indexService }: any) => (
                      <Component indexService={indexService} managedIndexService={managedIndexService} {...props} />
                    )}
                  </ServicesConsumer>
                </ModalProvider>
              </ServicesContext.Provider>
            )}
          />
          <Redirect from="/" to={ROUTES.CHANGE_POLICY} />
        </Switch>
      </Router>
    ),
  };
}

describe("<ChangePolicy /> spec", () => {
  it("renders the component", async () => {
    const { container } = renderWithRouter(ChangePolicy);

    await wait();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    renderWithRouter(ChangePolicy);

    expect(chrome.breadcrumbs.set).toHaveBeenCalledTimes(1);
    expect(chrome.breadcrumbs.set).toHaveBeenCalledWith([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.MANAGED_INDICES,
      BREADCRUMBS.CHANGE_POLICY,
    ]);
  });
});
