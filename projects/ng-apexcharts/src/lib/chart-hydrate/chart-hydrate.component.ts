import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Inject,
  Injector,
  input,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  runInInjectionContext,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ApexOptions } from "../model/apex-types";
import type ApexChartsType from "apexcharts";

/**
 * Client-side hydration component for ApexCharts SSR output.
 *
 * Must be placed immediately after `<apx-chart-ssr>` in the DOM. It finds
 * the server-rendered `[data-apexcharts-hydrate]` element in the preceding
 * `<apx-chart-ssr>` sibling and calls `ApexCharts.hydrate()` on it to
 * attach full interactivity (animations, tooltips, zoom, etc.).
 *
 * Uses afterNextRender so it runs after ChartSSRComponent has injected the
 * server HTML into the DOM (which also happens in afterNextRender).
 *
 * On the server this component does nothing.
 *
 * @example
 * <apx-chart-ssr [options]="chartOptions" />
 * <apx-chart-hydrate [clientOptions]="{ chart: { animations: { enabled: true } } }" />
 */
@Component({
  selector: "apx-chart-hydrate",
  template: ``,
  standalone: true,
})
export class ChartHydrateComponent implements OnInit, OnDestroy {
  readonly clientOptions = input<Partial<ApexOptions>>({});

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly injector = inject(Injector);
  private readonly isBrowser: boolean;
  private chartObj: ApexChartsType | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    runInInjectionContext(this.injector, () => afterNextRender(async () => {
      // By this point ChartSSRComponent's afterNextRender has already run,
      // so [data-apexcharts-hydrate] is guaranteed to be in the DOM.
      const host = this.el.nativeElement;
      const ssrEl = host.parentElement?.querySelector("[data-apexcharts-hydrate]") as HTMLElement | null;

      if (!ssrEl) {
        console.warn("[ng-apexcharts] ChartHydrateComponent: No [data-apexcharts-hydrate] element found. Ensure <apx-chart-ssr> precedes <apx-chart-hydrate> in the same container.");
        return;
      }

      const { default: ApexCharts } = await this.importClientModule();
      try {
        this.chartObj = this.ngZone.runOutsideAngular(() =>
          (ApexCharts as any).hydrate(ssrEl, this.clientOptions())
        );
      } catch (error) {
        console.error("[ng-apexcharts] ChartHydrateComponent: Failed to hydrate chart.", error);
      }
    }));
  }

  /** @internal Extracted to allow spying in unit tests without importing actual SSR/hydrate bundle. */
  protected importClientModule() {
    return import("apexcharts/ssr");
  }

  ngOnDestroy(): void {
    this.chartObj?.destroy();
    this.chartObj = null;
  }
}
