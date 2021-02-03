/*
 *   Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { Assign } from "@kbn/utility-types";
import { IndexManagementApp, RegisterIndexManagementAppArgs } from "../../../index_management";
import { IndexManagementSectionId } from "../utils/constants";
import { CreateIndexManagementItemArgs, IndexManagementItem } from "./IndexManagementItem";

export type RegisterIndexManagementSectionArgs = Assign<CreateIndexManagementItemArgs, { id: IndexManagementSectionId | string }>;

export class IndexManagementSection extends IndexManagementItem {
  public readonly apps: IndexManagementApp[] = [];

  constructor(args: CreateIndexManagementItemArgs) {
    super(args);
  }

  registerApp(args: Omit<RegisterIndexManagementAppArgs, "basePath">) {
    if (this.getApp(args.id)) {
      throw new Error(`IndexManagement app already registered - id: ${args.id}, title: ${args.title}`);
    }

    const app = new IndexManagementApp({
      ...args,
      basePath: `/${this.id}/${args.id}`,
    });

    this.apps.push(app);

    return app;
  }

  getApp(id: IndexManagementApp["id"]) {
    return this.apps.find((app) => app.id === id);
  }

  getAppsEnabled() {
    return this.apps.filter((app) => !app.isDisabled());
  }
}
