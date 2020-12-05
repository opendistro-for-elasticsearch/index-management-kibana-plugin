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

import { IRouter } from "kibana/server";
import { schema } from "@kbn/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";

export default function (services: NodeServices, router: IRouter) {
  const { managedIndexService } = services;

  router.get(
    {
      path: NODE_API.MANAGED_INDICES,
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
    managedIndexService.getManagedIndices
  );

  router.get(
    {
      path: `${NODE_API.MANAGED_INDICES}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    managedIndexService.getManagedIndex
  );

  router.post(
    {
      path: NODE_API.RETRY,
      validate: {
        body: schema.any(),
      },
    },
    managedIndexService.retryManagedIndexPolicy
  );

  router.post(
    {
      path: NODE_API.CHANGE_POLICY,
      validate: {
        body: schema.any(),
      },
    },
    managedIndexService.changePolicy
  );

  router.post(
    {
      path: NODE_API.REMOVE_POLICY,
      validate: {
        body: schema.any(),
      },
    },
    managedIndexService.removePolicy
  );
}
