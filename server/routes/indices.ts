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

import Server = Legacy.Server;

export default function(server: Server, services: NodeServices) {
  const { indexService } = services;

  server.route({
    path: NODE_API._SEARCH,
    method: REQUEST.POST,
    handler: indexService.search,
  });

  server.route({
    path: NODE_API._INDICES,
    method: REQUEST.GET,
    handler: indexService.getIndices,
  });

  server.route({
    path: NODE_API.APPLY_POLICY,
    method: REQUEST.POST,
    handler: indexService.applyPolicy,
  });

  server.route({
    path: NODE_API.EDIT_ROLLOVER_ALIAS,
    method: REQUEST.POST,
    handler: indexService.editRolloverAlias,
  });
}
