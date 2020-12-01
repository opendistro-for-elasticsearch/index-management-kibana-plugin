import { createContext } from "react";
import { CoreStart } from "kibana/public";

const CoreServicesContext = createContext<CoreStart | null>(null);

const CoreServicesConsumer = CoreServicesContext.Consumer;

export { CoreServicesContext, CoreServicesConsumer };
