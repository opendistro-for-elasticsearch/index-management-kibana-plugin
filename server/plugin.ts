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

import { IndexManagementPluginSetup, IndexManagementPluginStart } from ".";
import { Plugin, CoreSetup, CoreStart, IClusterClient } from "../../../src/core/server";
import ismPlugin from "./clusters/ism/ismPlugin";
import { PolicyService, ManagedIndexService, IndexService, RollupService } from "./services";
import { indices, policies, managedIndices, rollups } from "../server/routes";

export class IndexPatternManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  public async setup(core: CoreSetup) {
    // create Elasticsearch client that aware of ISM API endpoints
    const esDriver: IClusterClient = core.elasticsearch.legacy.createClient("index_management", {
      plugins: [ismPlugin],
    });

    // Initialize services
    const indexService = new IndexService(esDriver);
    const policyService = new PolicyService(esDriver);
    const managedIndexService = new ManagedIndexService(esDriver);
    const rollupService = new RollupService(esDriver);
    const services = { indexService, policyService, managedIndexService, rollupService };

    // create router
    const router = core.http.createRouter();
    // Add server routes
    indices(services, router);
    policies(services, router);
    managedIndices(services, router);
    rollups(services, router);

    return {};
  }

  public async start(core: CoreStart) {
    return {};
  }
}
