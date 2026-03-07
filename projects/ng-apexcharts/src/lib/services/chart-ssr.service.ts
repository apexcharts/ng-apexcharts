import { Injectable } from "@angular/core";
import { ApexOptions } from "../model/apex-types";

export interface ApexSSROptions {
  width?: number;
  height?: number;
}

@Injectable({
  providedIn: "root",
})
export class ChartSSRService {
  /** Per-app-instance counter for stable TransferState keys. Resets on each server bootstrap. */
  private instanceCounter = 0;

  nextInstanceId(): number {
    return this.instanceCounter++;
  }
  /** @internal Extracted to allow spying in unit tests without importing actual SSR bundle. */
  protected importSSRModule() {
    return import("apexcharts/ssr");
  }

  async renderToHTML(options: ApexOptions, ssrOptions: ApexSSROptions = {}): Promise<string> {
    const { default: ApexCharts } = await this.importSSRModule();
    return (ApexCharts as any).renderToHTML(options, ssrOptions);
  }

  async renderToString(options: ApexOptions, ssrOptions: ApexSSROptions = {}): Promise<string> {
    const { default: ApexCharts } = await this.importSSRModule();
    return (ApexCharts as any).renderToString(options, ssrOptions);
  }
}
