/*
 *   Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { AppMountParameters } from "kibana/public";
import { i18n } from "@kbn/i18n";
import React from "react";
import { sortBy } from "lodash";
import { EuiScreenReaderOnly, EuiSideNav, EuiSideNavItemType } from "@elastic/eui";
import { reactRouterNavigate } from "../../../../../../src/plugins/kibana_react/public";
import { IndexManagementSection } from "./IndexManagementSection";
import { IndexManagementApp } from "../../../index_management";
import { IndexManagementItem } from "./IndexManagementItem";

interface MainSidebarNavProps {
  sections: IndexManagementSection[];
  history: AppMountParameters["history"];
  selectedId: string;
}

const headerLabel = i18n.translate("management.nav.label", {
  defaultMessage: "Management",
});

const navMenuLabel = i18n.translate("management.nav.menu", {
  defaultMessage: "Management menu",
});

/** @internal **/
export const MainSidebarNav = ({ selectedId, sections, history }: MainSidebarNavProps) => {
  const HEADER_ID = "index-management-nav-header";

  const sectionsToNavItems = (managementSections: IndexManagementSection[]) => {
    const sortedManagementSections = sortBy(managementSections, "order");

    return sortedManagementSections.reduce<Array<EuiSideNavItemType<any>>>((acc, section) => {
      const apps = sortBy(section.getAppsEnabled(), "order");

      // if (apps.length) {
      //   acc.push({
      //     ...createNavItem(section, {
      //       items: appsToNavItems(apps),
      //     }),
      //   });
      // }

      return acc;
    }, []);
  };

  // TODO: Check if reactRouterNavigate is needed since this is from the kibana-react library.
  const appsToNavItems = (managementApps: IndexManagementApp[]) =>
    managementApps.map((app) => ({
      ...createNavItem(app, {
        ...reactRouterNavigate(history, app.basePath),
      }),
    }));

  const createNavItem = <T extends IndexManagementItem>(item: T, customParams: Partial<EuiSideNavItemType<any>> = {}) => {
    return {
      id: item.id,
      name: item.title,
      isSelected: item.id === selectedId,
      ...customParams,
    };
  };

  return (
    <>
      {/*<EuiScreenReaderOnly>*/}
      {/*  <h2 id={HEADER_ID}>{headerLabel}</h2>*/}
      {/*</EuiScreenReaderOnly>*/}
      <EuiSideNav aria-labelledby={HEADER_ID} mobileTitle={navMenuLabel} items={sectionsToNavItems(sections)} className="mgtSideBarNav" />
    </>

    //     Original version in Main,tsx
    // <EuiPageSideBar style={{ minWidth: 150 }}>
    //   <EuiSideNav style={{ width: 150 }} items={sideNav} />
    // </EuiPageSideBar>
  );
};
