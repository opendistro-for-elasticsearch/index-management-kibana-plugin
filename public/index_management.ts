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

import { AppMount } from "src/core/public";

export type CreateIndexManagementArgs = Omit<IndexManagementApp, "enable" | "disable" | "isDisabled"> & {
  disabled?: boolean;
};

export class IndexManagementApp {
  public readonly id: string;

  public readonly title: string;
  public readonly mount: AppMount;

  private disabled: boolean;

  public readonly tooltipContent?: string;

  public readonly enableRouting: boolean;

  public readonly order: number;

  constructor(id: string, title: string, mount: AppMount, enableRouting: boolean, order: number, toolTipContent = "", disabled = false) {
    this.id = id;
    this.title = title;
    this.mount = mount;
    this.enableRouting = enableRouting;
    this.order = order;
    this.tooltipContent = toolTipContent;
    this.disabled = disabled;
  }

  public enable() {
    this.disabled = false;
  }

  public disable() {
    this.disabled = true;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }
}

export const createIndexManagementApp = ({ id, title, mount, enableRouting, order, tooltipContent, disabled }: CreateIndexManagementArgs) =>
  new IndexManagementApp(id, title, mount, enableRouting, order, tooltipContent, disabled);
