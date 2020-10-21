/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { Legacy } from "kibana";
import { NodeServices } from "../models/interfaces";
import { NODE_API, REQUEST } from "../../utils/constants";

type Server = Legacy.Server;

export default function (server: Server, services: NodeServices) {
  const { rollupService } = services;

  server.route({
    path: NODE_API.ROLLUPS,
    method: REQUEST.GET,
    handler: rollupService.getRollups,
  });

  server.route({
    path: `${NODE_API.ROLLUPS}/{id}`,
    method: REQUEST.PUT,
    handler: rollupService.putRollup,
  });

  server.route({
    path: `${NODE_API.ROLLUPS}/{id}`,
    method: REQUEST.GET,
    handler: rollupService.getRollup,
  });

  server.route({
    path: `${NODE_API.ROLLUPS}/{id}`,
    method: REQUEST.DELETE,
    handler: rollupService.deleteRollup,
  });

  server.route({
    path: `${NODE_API.ROLLUPS}/{id}/_start`,
    method: REQUEST.POST,
    handler: rollupService.startRollup,
  });

  server.route({
    path: `${NODE_API.ROLLUPS}/{id}/_stop`,
    method: REQUEST.POST,
    handler: rollupService.stopRollup,
  });

  server.route({
    path: `${NODE_API._MAPPINGS}`,
    method: REQUEST.POST,
    handler: rollupService.getMappings,
  });
}
