import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ChartComponent } from "../chart/chart.component";

/**
 * Tree-shakeable variant of `<apx-chart>`.
 *
 * Loads `apexcharts/core` (~611 KB) instead of the full `apexcharts/client`
 * bundle (~942 KB). To register chart types and features, add side-effect
 * imports **before** this component is rendered — typically in `app.config.ts`
 * or at the top of the component that bootstraps the charts:
 *
 * ```ts
 * import "apexcharts/line";              // line, area, scatter, bubble
 * import "apexcharts/bar";               // bar, column, rangeBar
 * import "apexcharts/features/legend";   // opt-in legend
 * import "apexcharts/features/toolbar";  // opt-in toolbar
 * ```
 *
 * All inputs/outputs/methods are identical to `<apx-chart>`.
 */
@Component({
  selector: "apx-chart-core",
  template: `<div #chart></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ChartCoreComponent extends ChartComponent {
  protected override importApexCharts() {
    return import("apexcharts/core");
  }
}
