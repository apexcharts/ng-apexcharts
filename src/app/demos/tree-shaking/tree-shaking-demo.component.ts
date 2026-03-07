/**
 * Tree-Shaking Demo
 *
 * Uses `<apx-chart-core>` which loads `apexcharts/core` (~611 KB) instead of
 * the full `apexcharts/client` bundle (~942 KB). Only the chart types and
 * features imported below are included in the final bundle.
 *
 * Savings vs full bundle: ~35% (~331 KB raw, more when minzipped).
 *
 * Side-effect imports MUST occur before `<apx-chart-core>` renders — here they
 * are at module level, which runs at component load time. In a real app, put
 * them in app.config.ts or the root bootstrap file.
 */

// Register only the chart types and features this app needs.
import "apexcharts/line";             // line, area, scatter, bubble, rangeArea
import "apexcharts/bar";              // bar, column, barStacked, rangeBar
import "apexcharts/features/legend";  // opt-in legend
import "apexcharts/features/toolbar"; // opt-in toolbar
// NOT imported: exports, annotations, keyboard, pie, radar, heatmap, treemap…

import { Component, signal } from "@angular/core";
import { ChartCoreComponent } from "ng-apexcharts";
import { ApexAxisChartSeries, ApexChart, ApexLegend } from "ng-apexcharts";

@Component({
  selector: "app-tree-shaking-demo",
  standalone: true,
  imports: [ChartCoreComponent],
  template: `
    <section>
      <hgroup>
        <h2>Tree-shaking demo</h2>
        <p>
          Uses <code>&lt;apx-chart-core&gt;</code> which loads <code>apexcharts/core</code>
          (~611 KB) instead of the full bundle (~942 KB). Only <strong>line</strong> and
          <strong>bar</strong> chart types are registered here — legend and toolbar are
          opted in. Everything else (exports, annotations, keyboard, pie, radar…) is
          excluded from the build.
        </p>
      </hgroup>

      <article>
        <header>How it works</header>
        <p>
          Use <code>&lt;apx-chart-core&gt;</code> instead of <code>&lt;apx-chart&gt;</code>,
          then add side-effect imports for the chart types and features you need:
        </p>
        <pre><code>// In app.config.ts or your bootstrap file:
import "apexcharts/line";             // line, area, scatter, bubble
import "apexcharts/bar";              // bar, column, rangeBar
import "apexcharts/features/legend";  // opt-in legend
import "apexcharts/features/toolbar"; // opt-in toolbar

// In your template:
&lt;apx-chart-core [chart]="config" [series]="series" /&gt;</code></pre>
        <p>
          All inputs, outputs, and methods are identical to <code>&lt;apx-chart&gt;</code>.
          The only difference is which bundle is loaded.
        </p>
      </article>

      <div class="charts-grid">
        <div>
          <h3>Line chart</h3>
          <p class="hint">Registered via <code>apexcharts/line</code></p>
          <apx-chart-core
            [chart]="lineChartConfig()"
            [series]="lineSeries()"
            [legend]="legend()"
          />
        </div>

        <div>
          <h3>Bar chart</h3>
          <p class="hint">Registered via <code>apexcharts/bar</code></p>
          <apx-chart-core
            [chart]="barChartConfig()"
            [series]="barSeries()"
            [legend]="legend()"
          />
        </div>
      </div>
    </section>
  `,
  styles: [`
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 800px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
    .hint {
      font-size: 0.85rem;
      color: var(--pico-muted-color);
      margin-bottom: 0.5rem;
    }
    pre {
      background: var(--pico-code-background-color);
      border-radius: var(--pico-border-radius);
      padding: 1rem;
      overflow-x: auto;
    }
  `],
})
export class TreeShakingDemoComponent {
  readonly lineChartConfig = signal<ApexChart>({
    type: "line",
    height: 300,
    toolbar: { show: true },
  });

  readonly barChartConfig = signal<ApexChart>({
    type: "bar",
    height: 300,
    toolbar: { show: true },
  });

  readonly legend = signal<ApexLegend>({ show: true, position: "bottom" });

  readonly lineSeries = signal<ApexAxisChartSeries>([
    { name: "Revenue", data: [31, 40, 28, 51, 42, 109, 100] },
    { name: "Costs", data: [11, 32, 45, 32, 34, 52, 41] },
  ]);

  readonly barSeries = signal<ApexAxisChartSeries>([
    { name: "Q1", data: [44, 55, 57, 56] },
    { name: "Q2", data: [76, 85, 101, 98] },
  ]);
}
