import { PluginInitializerContext } from "kibana/public";
import { IndexManagementPlugin } from "./plugin";

export interface IndexManagementPluginSetup {}
export interface IndexManagementPluginStart {}

export function plugin(initializerContext: PluginInitializerContext) {
  return new IndexManagementPlugin(initializerContext);
}
