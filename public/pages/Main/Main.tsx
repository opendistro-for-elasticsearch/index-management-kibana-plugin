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

import React, { Component, useEffect, useRef } from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
// @ts-ignore
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar, EuiTabs, EuiToolTip, EuiTab } from "@elastic/eui";
import { CoreStart } from "kibana/public";
import Policies from "../Policies";
import ManagedIndices from "../ManagedIndices";
import Indices from "../Indices";
import CreatePolicy from "../CreatePolicy";
import ChangePolicy from "../ChangePolicy";
import Rollups from "../Rollups";
import { ModalProvider, ModalRoot } from "../../components/Modal";
import { ServicesConsumer } from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { ROUTES } from "../../utils/constants";
import { CoreServicesConsumer } from "../../components/core_services";
import CreateRollupForm from "../CreateRollup/containers/CreateRollupForm";
import EditRollup from "../EditRollup/containers";
import RollupDetails from "../RollupDetails/containers/RollupDetails";
import { IndexManagementPlugin } from "../../plugin";
import { IndexManagementApp } from "../../index_management";
import { DevToolApp } from "../../../../../src/plugins/dev_tools/public/dev_tool";

enum Navigation {
  IndexManagement = "Index Management",
  IndexStateManagement = "Index state management",
  IndexPolicies = "Index Policies",
  ManagedIndices = "Managed Indices",
  Indices = "Indices",
  Rollups = "Rollup Jobs",
  Policies = "Policies",
  All = "All",
  HotIndices = "Hot indices",
  UltraWarmIndices = "UltraWarm indices",
  ColdIndices = "Cold indices",
  PolicyManagedIndices = "Policy managed indices",
  Console = "Console",
}

enum Pathname {
  IndexPolicies = "/index-policies",
  ManagedIndices = "/managed-indices",
  Indices = "/indices",
  Rollups = "/rollups",
  Console = "/console",
}

interface MainProps extends RouteComponentProps {
  indexManagementApps: readonly IndexManagementApp[];
}

interface IndexManagementAppsWrapperProps {
  indexManagementApps: readonly IndexManagementApp[];
  activeIndexManagement: IndexManagementApp;
  updateRoute: (newRoute: string) => void;
}

interface MountedIndexManagementDescriptor {
  indexManagement: IndexManagementApp;
  mountpoint: HTMLElement;
  unmountHandler: () => void;
}

function IndexManagementAppsWrapper({ indexManagementApps, activeIndexManagement, updateRoute }: IndexManagementAppsWrapperProps) {
  const mountedTool = useRef<MountedIndexManagementDescriptor | null>(null);

  useEffect(
    () => () => {
      if (mountedTool.current) {
        mountedTool.current.unmountHandler();
      }
    },
    []
  );

  return (
    <main className="ismApp">
      <div
        className="ismApp__container"
        role="tabpanel"
        // data-test-subj={activeDevTool.id}
        ref={async (element) => {
          if (
            element &&
            (mountedTool.current === null ||
              mountedTool.current.indexManagement !== activeIndexManagement ||
              mountedTool.current.mountpoint !== element)
          ) {
            if (mountedTool.current) {
              mountedTool.current.unmountHandler();
            }

            const params = {
              element,
              appBasePath: "",
              onAppLeave: () => undefined,
              setHeaderActionMenu: () => undefined,
              // TODO: adapt to use Core's ScopedHistory
              history: {} as any,
            };

            const unmountHandler = await activeIndexManagement.mount(params);

            mountedTool.current = {
              indexManagement: activeIndexManagement,
              mountpoint: element,
              unmountHandler,
            };
          }
        }}
      />
    </main>
  );
}

export default class Main extends Component<MainProps, object> {
  render() {
    const {
      location: { pathname },
      indexManagementApps,
    } = this.props;
    const sideNav = [
      {
        name: Navigation.IndexManagement,
        id: 0,
        href: `#${Pathname.IndexPolicies}`,
        items: [
          {
            name: Navigation.IndexPolicies,
            id: 1,
            href: `#${Pathname.IndexPolicies}`,
            isSelected: pathname === Pathname.IndexPolicies,
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
          {
            name: Navigation.Rollups,
            id: 4,
            href: `#${Pathname.Rollups}`,
            isSelected: pathname === Pathname.Rollups,
          },
          /**
           * The bottom two items are for integration with Leviathan.
           * Need to look into how to define the items by checking whether Leviathan exists, and how to define the routes.
           **/
          {
            name: Navigation.IndexStateManagement,
            id: 5,
            href: `#${Pathname.IndexPolicies}`,
            forceOpen: true,
            items: [
              {
                name: Navigation.Policies,
                id: 1,
                href: `#${Pathname.IndexPolicies}`,
                isSelected: pathname === Pathname.IndexPolicies,
              },
            ],
          },
          {
            name: Navigation.Indices,
            id: 6,
            href: `#${Pathname.Indices}`,
            forceOpen: true,
            items: [
              {
                name: Navigation.All,
                id: 1,
                href: `#${Pathname.Indices}`,
                isSelected: pathname === Pathname.Indices,
              },
              {
                name: Navigation.PolicyManagedIndices,
                id: 2,
                href: `#${Pathname.ManagedIndices}`,
                isSelected: pathname === Pathname.ManagedIndices,
              },
            ],
          },
          {
            name: Navigation.Console,
            id: 7,
            href: `#${Pathname.Console}`,
            isSelected: pathname === Pathname.Console,
          },
        ],
      },
    ];
    // Debugging use to check whether the apps are passed in
    indexManagementApps.map((indexManagement: IndexManagementApp) => console.log(indexManagement.id));

    return (
      <CoreServicesConsumer>
        {(core: CoreStart | null) =>
          core && (
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <ModalProvider>
                    <ModalRoot services={services} />
                    <EuiPage>
                      {/*Hide side navigation bar when creating or editing rollup job*/}
                      {pathname != ROUTES.CREATE_ROLLUP && pathname != ROUTES.EDIT_ROLLUP && pathname != ROUTES.ROLLUP_DETAILS && (
                        <EuiPageSideBar style={{ minWidth: 150 }}>
                          <EuiSideNav style={{ width: 150 }} items={sideNav} />
                        </EuiPageSideBar>
                      )}
                      <EuiPageBody>
                        <Switch>
                          <Route
                            path={ROUTES.CHANGE_POLICY}
                            render={(props: RouteComponentProps) => (
                              <ChangePolicy
                                {...props}
                                managedIndexService={services.managedIndexService}
                                indexService={services.indexService}
                              />
                            )}
                          />
                          <Route
                            path={ROUTES.CREATE_POLICY}
                            render={(props: RouteComponentProps) => (
                              <CreatePolicy {...props} isEdit={false} policyService={services.policyService} />
                            )}
                          />
                          <Route
                            path={ROUTES.EDIT_POLICY}
                            render={(props: RouteComponentProps) => (
                              <CreatePolicy {...props} isEdit={true} policyService={services.policyService} />
                            )}
                          />
                          <Route
                            path={ROUTES.INDEX_POLICIES}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <Policies {...props} policyService={services.policyService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.MANAGED_INDICES}
                            render={(props: RouteComponentProps) => (
                              <div>
                                <ManagedIndices {...props} managedIndexService={services.managedIndexService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.INDICES}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <Indices {...props} indexService={services.indexService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.ROLLUPS}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <Rollups {...props} rollupService={services.rollupService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.CREATE_ROLLUP}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <CreateRollupForm {...props} rollupService={services.rollupService} indexService={services.indexService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.EDIT_ROLLUP}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <EditRollup {...props} rollupService={services.rollupService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.ROLLUP_DETAILS}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <RollupDetails {...props} rollupService={services.rollupService} />
                              </div>
                            )}
                          />
                          {indexManagementApps.map((indexManagement: IndexManagementApp) => (
                            <Route
                              key={indexManagement.id}
                              path={`/${indexManagement.id}`}
                              render={(props) => (
                                <div style={{ padding: "25px 25px" }}>
                                  <IndexManagementAppsWrapper
                                    updateRoute={props.history.push}
                                    activeIndexManagement={indexManagement}
                                    indexManagementApps={indexManagementApps}
                                  />
                                </div>
                              )}
                            />
                          ))}
                          {/*<Route*/}
                          {/*  path={ROUTES.CONSOLE}*/}
                          {/*  render={(props: RouteComponentProps) => <div style={{ padding: "25px 25px" }}>*/}
                          {/*  </div>}*/}
                          {/*/>*/}

                          <Redirect from="/" to={ROUTES.INDEX_POLICIES} />
                        </Switch>
                      </EuiPageBody>
                    </EuiPage>
                  </ModalProvider>
                )
              }
            </ServicesConsumer>
          )
        }
      </CoreServicesConsumer>
    );
  }
}
