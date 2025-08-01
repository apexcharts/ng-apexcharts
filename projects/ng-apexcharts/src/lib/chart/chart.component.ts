import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  OnChanges,
  OnDestroy,
  output,
  PLATFORM_ID,
  signal,
  SimpleChanges,
  viewChild,
} from "@angular/core";
import { asapScheduler } from "rxjs";
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

type ApexCharts = import("apexcharts");

declare global {
  interface Window {
    ApexCharts: typeof ApexCharts;
  }
}

@Component({
  selector: "apx-chart",
  template: `<div #chart></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ChartComponent implements OnChanges, OnDestroy {
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

  readonly chartReady = output<{ chartObj: ApexCharts }>();

  // If consumers need to capture the `chartInstance` for use, consumers
  // can access the component instance through `viewChild` and use `computed`
  // or `effect` on `component.chartInstance()` to monitor its changes and
  // recompute effects or computations whenever `chartInstance` is updated.
  readonly chartInstance = signal<ApexCharts | null>(null);

  private readonly chartElement =
    viewChild.required<ElementRef<HTMLElement>>("chart");

  private ngZone = inject(NgZone);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      asapScheduler.schedule(() => this.hydrate(changes));
    });
  }

  ngOnDestroy() {
    this.destroy();
  }

  private hydrate(changes: SimpleChanges): void {
    const shouldUpdateSeries =
      this.autoUpdateSeries() &&
      Object.keys(changes).filter((c) => c !== "series").length === 0;

    if (shouldUpdateSeries) {
      this.updateSeries(this.series(), true);
      return;
    }

    this.createElement();
  }

  private async createElement() {
    const { default: ApexCharts } = await import("apexcharts");
    window.ApexCharts ||= ApexCharts;

    const options: any = {};

    const properties = [
      "annotations",
      "chart",
      "colors",
      "dataLabels",
      "series",
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

    properties.forEach((property) => {
      const value = this[property]();
      if (value) {
        options[property] = value;
      }
    });

    this.destroy();

    const chartInstance = this.ngZone.runOutsideAngular(
      () => new ApexCharts(this.chartElement().nativeElement, options)
    );

    this.chartInstance.set(chartInstance);

    this.render();
    this.chartReady.emit({ chartObj: chartInstance });
  }

  public render() {
    return this.ngZone.runOutsideAngular(() => this.chartInstance()?.render());
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
      this.chartInstance()?.updateSeries(newSeries, animate)
    );
  }

  public appendSeries(
    newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries,
    animate?: boolean
  ) {
    this.ngZone.runOutsideAngular(() =>
      this.chartInstance()?.appendSeries(newSeries, animate)
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
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.paper());
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
}
