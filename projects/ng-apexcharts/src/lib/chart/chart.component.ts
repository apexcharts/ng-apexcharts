import { isPlatformBrowser } from "@angular/common";
import {
  afterEveryRender,
  afterNextRender,
  AfterRenderRef,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  NgZone,
  OnDestroy,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexForecastDataPoints,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNoData,
  ApexParsing,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from "../model/apex-types";
import type ApexChartsType from "apexcharts";

/**
 * Option inputs that are copied straight onto the ApexCharts config object.
 *
 * A reference change in any of these requires tearing the chart down and
 * re-creating it. `series` is deliberately excluded: it has a cheap
 * `updateSeries()` fast path, see {@link ChartComponent.autoUpdateSeries}.
 */
const STRUCTURAL_INPUTS = [
  "annotations",
  "chart",
  "colors",
  "dataLabels",
  "stroke",
  "labels",
  "legend",
  "fill",
  "tooltip",
  "plotOptions",
  "responsive",
  "markers",
  "noData",
  "parsing",
  "xaxis",
  "yaxis",
  "forecastDataPoints",
  "grid",
  "states",
  "title",
  "subtitle",
  "theme",
] as const;

type StructuralInput = (typeof STRUCTURAL_INPUTS)[number];

/** Reference snapshot of every structural input, as last applied to the chart. */
type StructuralSnapshot = Readonly<Record<StructuralInput, unknown>>;

/**
 * Compare two snapshots by reference, which is the same identity check Angular
 * itself used to decide whether to report an input in `SimpleChanges`.
 */
function structuralEquals(a: StructuralSnapshot, b: StructuralSnapshot): boolean {
  return STRUCTURAL_INPUTS.every((key) => a[key] === b[key]);
}

@Component({
  selector: "apx-chart",
  template: `<div #chart></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ChartComponent implements OnDestroy {
  readonly chart = input<ApexChart>();
  readonly annotations = input<ApexAnnotations>();
  readonly colors = input<any[]>();
  readonly dataLabels = input<ApexDataLabels>();
  readonly series = input<ApexAxisChartSeries | ApexNonAxisChartSeries>();
  readonly stroke = input<ApexStroke>();
  readonly labels = input<string[]>();
  readonly legend = input<ApexLegend>();
  readonly markers = input<ApexMarkers>();
  readonly noData = input<ApexNoData>();
  readonly parsing = input<ApexParsing>();
  readonly fill = input<ApexFill>();
  readonly tooltip = input<ApexTooltip>();
  readonly plotOptions = input<ApexPlotOptions>();
  readonly responsive = input<ApexResponsive[]>();
  readonly xaxis = input<ApexXAxis>();
  readonly yaxis = input<ApexYAxis | ApexYAxis[]>();
  readonly forecastDataPoints = input<ApexForecastDataPoints>();
  readonly grid = input<ApexGrid>();
  readonly states = input<ApexStates>();
  readonly title = input<ApexTitleSubtitle>();
  readonly subtitle = input<ApexTitleSubtitle>();
  readonly theme = input<ApexTheme>();

  readonly autoUpdateSeries = input(true);

  readonly chartReady = output<{ chartObj: ApexChartsType }>();

  // If consumers need to capture the `chartInstance` for use, consumers
  // can access the component instance through `viewChild` and use `computed`
  // or `effect` on `component.chartInstance()` to monitor its changes and
  // recompute effects or computations whenever `chartInstance` is updated.
  readonly chartInstance = signal<ApexChartsType | null>(null);

  private readonly chartElement =
    viewChild.required<ElementRef<HTMLElement>>("chart");

  private ngZone = inject(NgZone);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private _destroyed = false;
  private readonly _injector = inject(Injector);
  private waitingForConnectedRef: AfterRenderRef | null = null;

  /** Structural inputs as of the last completed `createElement()`. */
  private appliedStructural: StructuralSnapshot | null = null;

  /** True while a `createElement()` pass is queued or in flight. */
  private createScheduled = false;

  constructor() {
    // ApexCharts touches the DOM on construction, so it never runs on the server.
    if (this.isBrowser) {
      effect(() => {
        // Read every option input so the effect re-runs on any of them. The
        // reads must happen inside the reactive context; applying the change
        // must not, or writing `chartInstance` would re-trigger this effect.
        const structural = this.readStructuralInputs();
        const series = this.series();

        untracked(() => this.applyChanges(structural, series));
      });
    }
  }

  ngOnDestroy() {
    this.destroy();
    this._destroyed = true;
  }

  /** Determine if the host element is connected to the document */
  private get isConnected() {
    return this.chartElement()?.nativeElement.isConnected;
  }

  /** Tracked read of every structural input. Must run inside a reactive context. */
  private readStructuralInputs(): StructuralSnapshot {
    const snapshot = {} as Record<StructuralInput, unknown>;

    for (const key of STRUCTURAL_INPUTS) {
      snapshot[key] = this[key]();
    }

    return snapshot;
  }

  /**
   * Route an input change to either the cheap `updateSeries()` path or a full
   * re-create, mirroring what the chart currently has applied.
   */
  private applyChanges(
    structural: StructuralSnapshot,
    series: ApexAxisChartSeries | ApexNonAxisChartSeries | undefined
  ): void {
    // Nothing is bound yet: stay inert instead of constructing ApexCharts
    // with an empty config. Mirrors the old behaviour where ngOnChanges never
    // fired without a bound input. The effect re-runs once a value arrives.
    const hasAnyOption =
      !!series || STRUCTURAL_INPUTS.some((key) => structural[key]);

    if (!hasAnyOption) {
      return;
    }

    // A queued create reads the latest inputs when it runs, so collapse any
    // change that lands before then into it rather than doing duplicate work.
    if (this.createScheduled || this.waitingForConnectedRef) {
      return;
    }

    const seriesOnlyChange =
      this.chartInstance() !== null &&
      this.autoUpdateSeries() &&
      this.appliedStructural !== null &&
      structuralEquals(this.appliedStructural, structural) &&
      !!series;

    if (seriesOnlyChange) {
      this.updateSeries(series, true);
      return;
    }

    this.createScheduled = true;

    // Create the chart after the layout is finalized and ready to be measured.
    afterNextRender({
      read: () => this.createElement(),
    }, { injector: this._injector });
  }

  /** @internal Extracted to allow subclasses and tests to swap the ApexCharts bundle. */
  protected importApexCharts(): Promise<{ default: typeof ApexChartsType }> {
    return import("apexcharts/client");
  }

  private async createElement() {
    const { default: ApexCharts } = await this.importApexCharts();
    (window as any).ApexCharts ||= ApexCharts;

    if (this._destroyed) return;
    if (!this.isConnected) {
      this.waitForConnected();
      return;
    }

    // Read the inputs as late as possible: changes that landed while the
    // bundle was loading are picked up here instead of queueing another create.
    const structural = untracked(() => this.readStructuralInputs());
    const series = untracked(this.series);

    const options: any = {};
    for (const key of STRUCTURAL_INPUTS) {
      if (structural[key]) {
        options[key] = structural[key];
      }
    }
    if (series) {
      options.series = series;
    }

    this.appliedStructural = structural;
    this.createScheduled = false;

    this.destroy();

    const chartInstance = this.ngZone.runOutsideAngular(
      () => new ApexCharts(this.chartElement().nativeElement, options)
    );

    this.chartInstance.set(chartInstance);

    this.render();
    this.chartReady.emit({ chartObj: chartInstance });
  }

  public render() {
    if (this.isConnected) {
      return this.ngZone.runOutsideAngular(() => this.chartInstance()?.render());
    } else {
      this.waitForConnected();
    }
  }

  public updateOptions(
    options: any,
    redrawPaths?: boolean,
    animate?: boolean,
    updateSyncedCharts?: boolean
  ) {
    return this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.updateOptions(
        options,
        redrawPaths,
        animate,
        updateSyncedCharts
      )
    );
  }

  public updateSeries(
    newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries,
    animate?: boolean
  ) {
    return this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.updateSeries(newSeries as any, animate)
    );
  }

  public appendSeries(
    newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries,
    animate?: boolean
  ) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.appendSeries(newSeries as any, animate)
    );
  }

  public appendData(newData: any[]) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.appendData(newData)
    );
  }

  public highlightSeries(seriesName: string): any {
    return this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.highlightSeries(seriesName)
    );
  }

  public toggleSeries(seriesName: string): any {
    return this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.toggleSeries(seriesName)
    );
  }

  public showSeries(seriesName: string) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.showSeries(seriesName)
    );
  }

  public hideSeries(seriesName: string) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.hideSeries(seriesName)
    );
  }

  public resetSeries() {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.resetSeries());
  }

  public zoomX(min: number, max: number) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.zoomX(min, max));
  }

  public toggleDataPointSelection(
    seriesIndex: number,
    dataPointIndex?: number
  ) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.toggleDataPointSelection(
        seriesIndex,
        dataPointIndex
      )
    );
  }

  public destroy() {
    this.chartInstance()?.destroy();
    this.chartInstance.set(null);
  }

  public setLocale(localeName: string) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.setLocale(localeName)
    );
  }

  public paper() {
    this.ngZone.runOutsideAngular(() => (this.chartInstance() as any)?.paper());
  }

  public addXaxisAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.addXaxisAnnotation(options, pushToMemory, context)
    );
  }

  public addYaxisAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.addYaxisAnnotation(options, pushToMemory, context)
    );
  }

  public addPointAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.addPointAnnotation(options, pushToMemory, context)
    );
  }

  public removeAnnotation(id: string, options?: any) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.removeAnnotation(id, options)
    );
  }

  public clearAnnotations(options?: any) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.clearAnnotations(options)
    );
  }

  public dataURI(options?: any) {
    return this.chartInstance()?.dataURI(options);
  }

  private waitForConnected() {
    if (this.waitingForConnectedRef) {
      return;
    }

    this.waitingForConnectedRef = afterEveryRender({
      read: () => {
        if (this.isConnected) {
          this.waitingForConnectedRef?.destroy();
          this.waitingForConnectedRef = null;
          this.createElement();
        }
      },
    }, { injector: this._injector });
  }
}
