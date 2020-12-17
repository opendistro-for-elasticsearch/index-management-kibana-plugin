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
