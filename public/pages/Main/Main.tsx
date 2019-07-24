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

import React, { Component } from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { IHttpService } from "angular";
// @ts-ignore
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar } from "@elastic/eui";
import Policies from "../Policies";
import ManagedIndices from "../ManagedIndices";
import Indices from "../Indices";
import CreatePolicy from "../CreatePolicy";
import { ModalProvider, ModalRoot } from "../../components/Modal";
import { ServicesConsumer } from "../../services/Services";

enum Navigation {
  IndexManagement = "Index Management",
  Policies = "Policies",
  ManagedIndices = "Managed Indices",
  Indices = "Indices",
}

enum Pathname {
  Policies = "/policies",
  ManagedIndices = "/managed-indices",
  Indices = "/indices",
}

interface MainProps extends RouteComponentProps {
  httpClient: IHttpService;
}

class Main extends Component<MainProps, object> {
  render() {
    const {
      httpClient,
      location: { pathname },
    } = this.props;
    const sideNav = [
      {
        name: Navigation.IndexManagement,
        id: 0,
        href: `#${Pathname.Policies}`,
        items: [
          {
            name: Navigation.Policies,
            id: 1,
            href: `#${Pathname.Policies}`,
            isSelected: pathname === Pathname.Policies,
          },
          {
            name: Navigation.ManagedIndices,
            id: 2,
            href: `#${Pathname.ManagedIndices}`,
            isSelected: pathname === Pathname.ManagedIndices,
          },
          {
            name: Navigation.Indices,
            id: 3,
            href: `#${Pathname.Indices}`,
            isSelected: pathname === Pathname.Indices,
          },
        ],
      },
    ];
    return (
      <ModalProvider>
        <ServicesConsumer>{services => services && <ModalRoot services={services} />}</ServicesConsumer>
        <EuiPage>
          <EuiPageSideBar style={{ minWidth: 150 }}>
            <EuiSideNav style={{ width: 150 }} items={sideNav} />
          </EuiPageSideBar>
          <EuiPageBody>
            <Switch>
              <Route
                path="/create-policy"
                render={(props: RouteComponentProps) => <CreatePolicy {...props} isEdit={false} httpClient={httpClient} />}
              />
              <Route
                path="/edit-policy"
                render={(props: RouteComponentProps) => <CreatePolicy {...props} isEdit={true} httpClient={httpClient} />}
              />
              <Route
                path="/policies"
                render={(props: RouteComponentProps) => (
                  <div style={{ padding: "25px 25px" }}>
                    <Policies {...props} httpClient={httpClient} />
                  </div>
                )}
              />
              <Route
                path="/managed-indices"
                render={(props: RouteComponentProps) => (
                  <div style={{ padding: "25px 25px" }}>
                    <ManagedIndices {...props} httpClient={httpClient} />
                  </div>
                )}
              />
              <Route
                path="/indices"
                render={(props: RouteComponentProps) => (
                  <div style={{ padding: "25px 25px" }}>
                    <ServicesConsumer>{({ indexService }: any) => <Indices {...props} indexService={indexService} />}</ServicesConsumer>
                  </div>
                )}
              />
              <Redirect from="/" to="/policies" />
            </Switch>
          </EuiPageBody>
        </EuiPage>
      </ModalProvider>
    );
  }
}

export default Main;
