import { IndexManagementPluginSetup, IndexManagementPluginStart } from ".";
import { Plugin, CoreSetup, CoreStart, IClusterClient } from "../../../src/core/server";
import ismPlugin from "./clusters/ism/ismPlugin";
import { PolicyService, ManagedIndexService, IndexService } from "./services";
import { indices, policies, managedIndices } from "../server/routes";

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
    const services = { indexService, policyService, managedIndexService };

    // create router
    const router = core.http.createRouter();
    // Add server routes
    indices(services, router);
    policies(services, router);
    managedIndices(services, router);
    return {};
  }

  public async start(core: CoreStart) {
    return {};
  }
}
