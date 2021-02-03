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

export type CreateIndexManagementItemArgs = Omit<IndexManagementItem, "enable" | "disable" | "isDisabled"> & {
  disabled?: boolean;
};

export class IndexManagementItem {
  public readonly id: string;
  public readonly title: string;
  public readonly tooltipContent?: string;
  public readonly enableRouting?: boolean;
  public readonly order: number;
  private disabled: boolean = false;

  constructor({ id, title, enableRouting, order, tooltipContent }: CreateIndexManagementItemArgs) {
    this.id = id;
    this.title = title;
    this.enableRouting = enableRouting;
    this.order = order;
    this.tooltipContent = tooltipContent;
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

export const createIndexManagementItem = (args: CreateIndexManagementItemArgs) => new IndexManagementItem(args);
