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
import { uiModules } from "ui/modules";
import chrome from "ui/chrome";
import { render, unmountComponentAtNode } from "react-dom";
import { HashRouter as Router, Route } from "react-router-dom";

import "ui/autoload/styles";
import Main from "./pages/Main";
import { ServicesContext, IndexService } from "./services";

const app = uiModules.get("apps/indexManagementKibana");

app.config($locationProvider => {
  $locationProvider.html5Mode({
    enabled: false,
    requireBase: false,
    rewriteLinks: false,
  });
});
app.config(stateManagementConfigProvider => stateManagementConfigProvider.disable());

function RootController($scope, $element, $http) {
  const domNode = $element[0];

  // set up services
  const indexService = new IndexService($http);
  const services = { indexService };

  // render react to DOM
  render(
    <Router>
      <Route
        render={props => (
          <ServicesContext.Provider value={services}>
            <Main httpClient={$http} {...props} />
          </ServicesContext.Provider>
        )}
      />
    </Router>,
    domNode
  );

  // unmount react on controller destroy
  $scope.$on("$destroy", () => {
    unmountComponentAtNode(domNode);
  });
}

chrome.setRootController("indexManagementKibana", RootController);
