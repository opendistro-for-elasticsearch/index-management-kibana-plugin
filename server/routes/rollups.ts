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

import { IRouter } from "kibana/server";
import { schema } from "@kbn/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
//TODO: Update this to upgrade to 7.10 and clean up code

export default function (services: NodeServices, router: IRouter) {
  const { rollupService } = services;

  // server.route({
  //   path: NODE_API.ROLLUPS,
  //   method: REQUEST.GET,
  //   handler: rollupService.getRollups,
  // });

  router.get(
    {
      path: NODE_API.ROLLUPS,
      validate: {
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          search: schema.string(),
          sortField: schema.string(),
          sortDirection: schema.string(),
        }),
      },
    },
    rollupService.getRollups
  );

  // server.route({
  //   path: `${NODE_API.ROLLUPS}/{id}`,
  //   method: REQUEST.PUT,
  //   handler: rollupService.putRollup,
  // });

  router.put(
    {
      path: `${NODE_API.ROLLUPS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          seqNo: schema.number(),
          primaryTerm: schema.number(),
        }),
        body: schema.any(),
      },
    },
    rollupService.putRollup
  );

  // server.route({
  //   path: `${NODE_API.ROLLUPS}/{id}`,
  //   method: REQUEST.GET,
  //   handler: rollupService.getRollup,
  // });

  router.get(
    {
      path: `${NODE_API.ROLLUPS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    rollupService.getRollup
  );

  router.delete(
    {
      path: `${NODE_API.ROLLUPS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    rollupService.deleteRollup
  );

  router.post(
    {
      path: `${NODE_API.ROLLUPS}/{id}/_start`,
      validate: {
        body: schema.any(),
      },
    },
    rollupService.startRollup
  );

  router.post(
    {
      path: `${NODE_API.ROLLUPS}/{id}/_stop`,
      validate: {
        body: schema.any(),
      },
    },
    rollupService.stopRollup
  );

  router.post(
    {
      path: NODE_API._MAPPINGS,
      validate: {
        body: schema.any(),
      },
    },
    rollupService.getMappings
  );
}
