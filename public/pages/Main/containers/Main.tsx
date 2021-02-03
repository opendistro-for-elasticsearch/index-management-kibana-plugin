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

import React, { Component, useEffect, useRef, useState } from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
// @ts-ignore
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar, EuiTabs, EuiToolTip, EuiTab, EuiPanel } from "@elastic/eui";
import { AppMountParameters, ChromeBreadcrumb, CoreStart } from "kibana/public";
import Policies from "../../Policies";
import ManagedIndices from "../../ManagedIndices";
import Indices from "../../Indices";
import CreatePolicy from "../../CreatePolicy";
import ChangePolicy from "../../ChangePolicy";
import Rollups from "../../Rollups";
import { ModalProvider, ModalRoot } from "../../../components/Modal";
import { ServicesConsumer } from "../../../services";
import { BrowserServices } from "../../../models/interfaces";
import { ROUTES } from "../../../utils/constants";
import { CoreServicesConsumer } from "../../../components/core_services";
import CreateRollupForm from "../../CreateRollup/containers/CreateRollupForm";
import EditRollup from "../../EditRollup/containers";
import RollupDetails from "../../RollupDetails/containers/RollupDetails";
import { MainSectionsServiceStart, Navigation, Pathname } from "../utils/constants";
import { IndexManagementSection } from "../components/IndexManagementSection";
import { IndexManagementItem } from "../components/IndexManagementItem";

interface MainProps extends RouteComponentProps {
  indexManagementApps: readonly IndexManagementItem[];
  appBasePath: string;
  history: AppMountParameters["history"];
  dependencies: IndexManagementAppDependencies;
}

export interface IndexManagementAppDependencies {
  sections: MainSectionsServiceStart;
  kibanaVersion: string;
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
}

interface IndexManagementAppsWrapperProps {
  indexManagementApps: readonly IndexManagementItem[];
  activeIndexManagement: IndexManagementItem;
  updateRoute: (newRoute: string) => void;
}

interface MountedIndexManagementDescriptor {
  indexManagement: IndexManagementItem;
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
    <EuiPanel style={{ paddingLeft: "0px", paddingRight: "0px" }}>
      <div
        style={{ padding: "25px 25px", height: "100%" }}
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
    </EuiPanel>
  );
}

export default class Main extends Component<MainProps, object> {
  render() {
    const {
      location: { pathname },
      indexManagementApps,
      dependencies,
      // history,
    } = this.props;
    // const { setBreadcrumbs } = dependencies;
    // const [selectedId, setSelectedId] = useState<string>('');
    // const [sections, setSections] = useState<IndexManagementSection[]>();
    const sideNav = [
      {
        name: Navigation.IndexManagement,
        id: 0,
        href: `#${Pathname.StateManagementPolicies}`,
        items: [
          {
            name: Navigation.RollupJobs,
            id: 1,
            href: `#${Pathname.RollupJobs}`,
            isSelected: pathname === Pathname.RollupJobs,
          },
          // Saving a space for transform jobs
          // {
          //   name: Navigation.TransformJobs,
          //   id: 2,
          //   href: `#${Pathname.TransformJobs}`,
          //   isSelected: pathname === Pathname.TransformJobs,
          // },
          {
            name: Navigation.StateManagementPolicies,
            id: 3,
            href: `#${Pathname.StateManagementPolicies}`,
            isSelected: pathname === Pathname.StateManagementPolicies,
          },
          {
            name: Navigation.Indices,
            id: 4,
            href: `#${Pathname.Indices}`,
            isSelected: pathname === Pathname.Indices,
            forceOpen: true,
            /**
             * The bottom items are for integration with Leviathan.
             * Need to look into how to define the items by checking whether Leviathan exists, and how to define the routes.
             **/
            items: [
              {
                name: Navigation.HotIndices,
                id: 1,
                href: `#${Pathname.HotIndices}`,
                isSelected: pathname === Pathname.HotIndices,
              },
              {
                name: Navigation.UltraWarmIndices,
                id: 2,
                href: `#${Pathname.UltraWarmIndices}`,
                isSelected: pathname === Pathname.UltraWarmIndices,
              },
              {
                name: Navigation.ColdIndices,
                id: 3,
                href: `#${Pathname.ColdIndices}`,
                isSelected: pathname === Pathname.ColdIndices,
              },
              {
                name: Navigation.PolicyManagedIndices,
                id: 4,
                href: `#${Pathname.PolicyManagedIndices}`,
                isSelected: pathname === Pathname.PolicyManagedIndices,
              },
            ],
          },
          {
            name: Navigation.Console,
            id: 7,
            href: `#${Pathname.Console}`,
            isSelected: pathname === Pathname.Console,
          },
          {
            name: Navigation.SecurityPOC,
            id: 8,
            href: `#${Pathname.SecurityPOC}`,
            isSelected: pathname === Pathname.SecurityPOC,
          },
        ],
      },
    ];

    // const setBreadcrumbsScoped = useCallback(
    //   (crumbs: ChromeBreadcrumb[] = [], appHistory?: ScopedHistory) => {
    //     const wrapBreadcrumb = (item: ChromeBreadcrumb, scopedHistory: ScopedHistory) => ({
    //       ...item,
    //       ...(item.href ? reactRouterNavigate(scopedHistory, item.href) : {}),
    //     });
    //
    //     // setBreadcrumbs([
    //     //   wrapBreadcrumb(MANAGEMENT_BREADCRUMB, history),
    //     //   ...crumbs.map((item) => wrapBreadcrumb(item, appHistory || history)),
    //     // ]);
    //   },
    //   [setBreadcrumbs, history]
    // );

    // useEffect(() => {
    //   setSections(dependencies.sections.getSectionsEnabled());
    // }, [dependencies.sections]);

    // if (!sections) {
    //   return null;
    // }

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
                        <EuiPageSideBar style={{ minWidth: 200 }}>
                          <EuiSideNav style={{ width: 200 }} items={sideNav} />
                        </EuiPageSideBar>
                      )}
                      {/*<MainSidebarNav sections={sections} selectedId={selectedId} history={history} />*/}
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
                            path={ROUTES.STATE_MANAGEMENT_POLICIES}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <Policies {...props} policyService={services.policyService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.POLICY_MANAGED_INDICES}
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
                            path={ROUTES.ROLLUP_JOBS}
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
                          {/*Routes from external plugins*/}
                          {indexManagementApps
                            .filter((indexManagement) => !indexManagement.isDisabled())
                            .map((indexManagement: IndexManagementItem) => (
                              <Route
                                key={indexManagement.id}
                                path={`/${indexManagement.id}`}
                                render={(props) => (
                                  <IndexManagementAppsWrapper
                                    {...props}
                                    updateRoute={props.history.push}
                                    activeIndexManagement={indexManagement}
                                    indexManagementApps={indexManagementApps}
                                  />
                                )}
                              />
                            ))}

                          <Redirect from="/" to={ROUTES.STATE_MANAGEMENT_POLICIES} />
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
