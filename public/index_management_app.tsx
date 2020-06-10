import { CoreStart, AppMountParameters } from "kibana/public";
import React from "react";
import ReactDOM from "react-dom";
import { render, unmountComponentAtNode } from "react-dom";
import { HashRouter as Router, Route } from "react-router-dom";
import { IndexService, ManagedIndexService, PolicyService, ServicesContext } from "./services";
import { DarkModeContext } from "./components/DarkMode";
import Main from "./pages/Main";
import { CoreServiesContext } from "./components/core_services";

export function renderApp(coreStart: CoreStart, params: AppMountParameters) {
  const http = coreStart.http;

  const indexService = new IndexService(http);
  const managedIndexService = new ManagedIndexService(http);
  const policyService = new PolicyService(http);
  const services = { indexService, managedIndexService, policyService };

  // const isDarkMode = chrome.getUiSettingsClient().get("theme:darkMode") || false;
  const isDarkMode = coreStart.uiSettings.get("theme:darkMode") || false;

  ReactDOM.render(
    <Router>
      <Route
        render={(props) => (
          <DarkModeContext.Provider value={isDarkMode}>
            <ServicesContext.Provider value={services}>
              <CoreServiesContext.Provider value={coreStart}>
                <Main {...props} />
              </CoreServiesContext.Provider>
            </ServicesContext.Provider>
          </DarkModeContext.Provider>
        )}
      />
    </Router>,
    params.element
  );
  return () => ReactDOM.unmountComponentAtNode(params.element);
}
