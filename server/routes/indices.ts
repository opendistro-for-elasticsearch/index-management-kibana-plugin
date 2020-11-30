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

import { schema } from "@kbn/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
import { IRouter } from "../../../../src/core/server";

export default function (services: NodeServices, router: IRouter) {
  const { indexService } = services;

  router.post(
    {
      path: NODE_API._SEARCH,
      validate: {
        body: schema.any(),
      },
    },
    indexService.search
  );

  router.get(
    {
      path: NODE_API._INDICES,
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
    indexService.getIndices
  );

  router.post(
    {
      path: NODE_API.APPLY_POLICY,
      validate: {
        body: schema.any(),
      },
    },
    indexService.applyPolicy
  );

  router.post(
    {
      path: NODE_API.EDIT_ROLLOVER_ALIAS,
      validate: {
        body: schema.any(),
      },
    },
    indexService.editRolloverAlias
  );
}
