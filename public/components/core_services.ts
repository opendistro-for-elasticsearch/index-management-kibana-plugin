import { createContext } from "react";
import { CoreStart } from "kibana/public";

const CoreServiesContext = createContext<CoreStart | null>(null);

const CoreServicesConsumer = CoreServiesContext.Consumer;

export { CoreServiesContext, CoreServicesConsumer };
