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
import { Services } from "../models/interfaces";
import Server = Legacy.Server;

export default function(server: Server, services: Services) {
  const { managedIndexService } = services;

  server.route({
    path: "/api/ism/indices",
    method: "GET",
    handler: managedIndexService.getManagedIndices,
  });

  server.route({
    path: "/api/ism/indices/{id}",
    method: "GET",
    handler: managedIndexService.getManagedIndex,
  });

  server.route({
    path: "/api/ism/retry",
    method: "POST",
    handler: managedIndexService.retryManagedIndexPolicy,
  });

  server.route({
    path: "/api/ism/change",
    method: "POST",
    handler: () => {}, // TODO
  });

  server.route({
    path: "/api/ism/remove",
    method: "POST",
    handler: () => {}, // TODO
  });
}
