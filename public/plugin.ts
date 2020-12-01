import { AppMountParameters, CoreSetup, CoreStart, Plugin, PluginInitializerContext } from "../../../src/core/public";
import { IndexManagementPluginSetup } from ".";
import { IndexManagementPluginStart } from ".";

export class IndexManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  public setup(core: CoreSetup): IndexManagementPluginSetup {
    core.application.register({
      id: "indexManagement",
      title: "Index Management",
      order: 7000,
      category: {
        id: 'odfe',
        label: 'Open Distro for Elasticsearch',
        order: 2000,
      },
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import("./index_management_app");
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params);
      },
    });
    return {};
  }

  public start(core: CoreStart): IndexManagementPluginStart {
    return {};
  }
}
