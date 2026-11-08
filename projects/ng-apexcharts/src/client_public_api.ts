/*
 * Client-only public API of ng-apexcharts.
 *
 * Keep core and SSR component entrypoints out of this graph so bundlers only
 * see the client ApexCharts dynamic import when consumers use this subpath.
 */
export { ChartComponent } from "./lib/chart/chart.component";
export * from "./lib/model/apex-types";
