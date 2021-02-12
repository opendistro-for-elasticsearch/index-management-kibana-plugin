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

import { AppMountParameters, CoreSetup, CoreStart, Plugin, PluginInitializerContext } from "../../../src/core/public";
import { IndexManagementPluginSetup, IndexManagementPluginStart } from ".";
import { createIndexManagementApp, CreateIndexManagementArgs, IndexManagementApp } from "./index_management";
import { sortBy } from "lodash";

export class IndexManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  //TODO: Utilize initializerContext if needed for plugin registration

  constructor(
    private readonly initializerContext: PluginInitializerContext,
    private readonly indexManagementApps: Map<string, IndexManagementApp>
  ) {
    // can retrieve config from initializerContext
  }

  private getSortedIndexManagements(): readonly IndexManagementApp[] {
    return sortBy([...this.indexManagementApps.values()], "order");
  }

  public setup(core: CoreSetup, indexManagement: IndexManagementPlugin): IndexManagementPluginSetup {
    core.application.register({
      id: "opendistro_index_management_kibana",
      title: "Index Management",
      order: 7000,
      category: {
        id: "odfe",
        label: "Open Distro for Elasticsearch",
        order: 2000,
      },
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import("./index_management_app");
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, this.getSortedIndexManagements());
      },
    });

    return {
      register: (indexManagementArgs: CreateIndexManagementArgs) => {
        if (this.indexManagementApps.has(indexManagementArgs.id)) {
          throw new Error(`Index management with id [${indexManagementArgs.id}] has already been registered. Use a unique id.`);
        }

        const indexManagement = createIndexManagementApp(indexManagementArgs);
        this.indexManagementApps.set(indexManagement.id, indexManagement);
        return indexManagement;
      },
    };
  }

  public start(core: CoreStart): IndexManagementPluginStart {
    return {};
  }
}
