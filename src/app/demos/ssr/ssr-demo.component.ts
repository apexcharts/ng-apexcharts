/**
 * SSR Demo
 *
 * Demonstrates two SSR patterns provided by ng-apexcharts:
 *
 * Pattern A — `<apx-chart-ssr>`:
 *   Renders a static chart SVG on the server (Angular Universal / SSR).
 *   On the client the slot is empty — no interactivity is attached.
 *   Use this for purely decorative / read-only charts where SEO matters.
 *
 * Pattern B — `<apx-chart-ssr>` + `<apx-chart-hydrate>`:
 *   Renders a static snapshot on the server and then hydrates it with full
 *   interactivity (tooltips, zoom, animations) on the client using
 *   `ApexCharts.hydrate()`.
 *
 * The existing `<apx-chart>` (client-only) is still used for interactive
 * charts that do not need SSR. It now imports from `apexcharts/client`
 * internally so it is safe to import in Universal apps — it simply skips
 * rendering on the server.
 *
 * IMPORTANT: This demo requires the SSR dev server (`npm start` with SSR
 * configured in angular.json). In pure client-side mode, `<apx-chart-ssr>`
 * renders nothing because `isPlatformServer()` returns false in the browser.
 */
import { Component, signal } from "@angular/core";
import { ChartComponent, ChartSSRComponent, ChartHydrateComponent } from "ng-apexcharts";
import { ApexOptions } from "ng-apexcharts";

@Component({
  selector: "app-ssr-demo",
  standalone: true,
  imports: [ChartComponent, ChartSSRComponent, ChartHydrateComponent],
  template: `
    <section>
      <hgroup>
        <h2>SSR + Hydration demo</h2>
        <p>
          Requires <strong>Angular SSR</strong> to observe server-side rendering.
          Run <code>npm start</code> — the Angular CLI dev-server renders the initial HTML on the Node.js
          server, then the client takes over.
        </p>
      </hgroup>

      <!-- Pattern A -->
      <article>
        <header>
          <strong>Pattern A</strong> &mdash; Static SSR chart
          (<code>&lt;apx-chart-ssr&gt;</code>)
        </header>
        <p>
          Rendered as a static SVG on the server. No JavaScript is attached on the client &mdash;
          ideal for read-only charts in SEO-critical pages (e.g. blog posts, dashboards above the fold).
        </p>
        <pre><code>&lt;apx-chart-ssr [options]="chartOptions" [width]="500" [height]="300" /&gt;</code></pre>
        <div class="chart-wrapper">
          <apx-chart-ssr
            [options]="ssrOptions()"
            [width]="500"
            [height]="300"
          />
        </div>
        <p class="hint">
          View page source in your browser &mdash; the SVG is present in the HTML before any JS executes.
          In pure client-side mode (no SSR), this renders blank (by design).
        </p>
      </article>

      <!-- Pattern B -->
      <article>
        <header>
          <strong>Pattern B</strong> &mdash; SSR snapshot + client hydration
          (<code>&lt;apx-chart-ssr&gt;</code> + <code>&lt;apx-chart-hydrate&gt;</code>)
        </header>
        <p>
          Server renders a static SVG for fast first paint and SEO. Then
          <code>ApexCharts.hydrate()</code> attaches full interactivity
          (tooltips, zoom, animations) on the client &mdash; without re-rendering the chart.
        </p>
        <pre><code>&lt;apx-chart-ssr [options]="chartOptions" [width]="500" [height]="300" /&gt;
&lt;apx-chart-hydrate [clientOptions]="hydrateOptions" /&gt;</code></pre>
        <div class="chart-wrapper">
          <apx-chart-ssr
            [options]="ssrOptions()"
            [width]="500"
            [height]="300"
          />
          <apx-chart-hydrate [clientOptions]="hydrateOptions()" />
        </div>
        <p class="hint">
          <code>&lt;apx-chart-hydrate&gt;</code> renders an empty container on the server.
          On the client it calls <code>ApexCharts.hydrate()</code> which finds the server-rendered SVG
          from the preceding <code>&lt;apx-chart-ssr&gt;</code> and upgrades it in-place.
        </p>
      </article>

      <!-- Pattern C -->
      <article>
        <header>
          <strong>Pattern C</strong> &mdash; Classic client-only chart
          (<code>&lt;apx-chart&gt;</code>)
        </header>
        <p>
          The existing <code>&lt;apx-chart&gt;</code> component is unchanged. It now imports from
          <code>apexcharts/client</code> internally, making it safe to import in SSR apps &mdash;
          on the server it simply renders nothing.
        </p>
        <pre><code>&lt;apx-chart [chart]="clientChartConfig" [series]="..." /&gt;</code></pre>
        <div class="chart-wrapper">
          <apx-chart
            [chart]="clientChartConfig"
            [series]="clientSeries"
          />
        </div>
        <p class="hint">
          Renders nothing on the server &mdash; that's expected. Use Pattern A or B when
          server-rendered HTML matters.
        </p>
      </article>
    </section>
  `,
  styles: [`
    article {
      margin-bottom: 2rem;
    }
    article header {
      font-size: 1rem;
    }
    .chart-wrapper {
      margin: 1rem 0;
      padding: 1rem;
      border: 1px solid var(--pico-muted-border-color);
      border-radius: var(--pico-border-radius);
      background: var(--pico-card-background-color);
    }
    .hint {
      font-size: 0.85rem;
      color: var(--pico-muted-color);
    }
    pre {
      background: var(--pico-code-background-color);
      border-radius: var(--pico-border-radius);
      padding: 1rem;
      overflow-x: auto;
      font-size: 0.85rem;
    }
  `],
})
export class SsrDemoComponent {
  readonly ssrOptions = signal<ApexOptions>({
    chart: { type: "bar", height: 300 },
    series: [
      { name: "Visitors", data: [44, 55, 57, 56, 61, 58, 63, 60, 66] },
    ],
    xaxis: {
      categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    },
    title: { text: "Monthly Site Visits", align: "left" },
  });

  readonly hydrateOptions = signal<Partial<ApexOptions>>({
    chart: {
      // `type` is required by ApexChart but hydrate() only merges what's provided.
      // Cast to any so we can pass a partial chart config without a type.
      animations: { enabled: true, speed: 800 },
    } as any,
  });

  readonly clientChartConfig = { type: "line" as const, height: 300 };
  readonly clientSeries = [{ name: "Series", data: [31, 40, 28, 51, 42, 109, 100] }];
}
