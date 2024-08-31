import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  signal,
  SimpleChanges,
  ViewChild,
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

declare global {
  interface Window {
    ApexCharts: any;
  }
}

@Component({
  selector: "apx-chart",
  template: `<div #chart></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ChartComponent implements OnChanges, OnDestroy {
  @Input() chart?: ApexChart;
  @Input() annotations?: ApexAnnotations;
  @Input() colors?: any[];
  @Input() dataLabels?: ApexDataLabels;
  @Input() series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  @Input() stroke?: ApexStroke;
  @Input() labels?: string[];
  @Input() legend?: ApexLegend;
  @Input() markers?: ApexMarkers;
  @Input() noData?: ApexNoData;
  @Input() fill?: ApexFill;
  @Input() tooltip?: ApexTooltip;
  @Input() plotOptions?: ApexPlotOptions;
  @Input() responsive?: ApexResponsive[];
  @Input() xaxis?: ApexXAxis;
  @Input() yaxis?: ApexYAxis | ApexYAxis[];
  @Input() forecastDataPoints?: ApexForecastDataPoints;
  @Input() grid?: ApexGrid;
  @Input() states?: ApexStates;
  @Input() title?: ApexTitleSubtitle;
  @Input() subtitle?: ApexTitleSubtitle;
  @Input() theme?: ApexTheme;

  @Input() autoUpdateSeries = true;

  @Output() chartReady = new EventEmitter();

  @ViewChild("chart", { static: true }) private chartElement: ElementRef;

  // The instance stored in `signal` will be exposed in the future.
  // Consumers can then use it in conjunction with `computed` to retrieve
  // the latest chart instance and execute logic on the chart whenever it changes.
  private chartInstance = signal<import("apexcharts") | null>(null);

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
      this.autoUpdateSeries &&
      Object.keys(changes).filter((c) => c !== "series").length === 0;

    if (shouldUpdateSeries) {
      this.updateSeries(this.series, true);
      return;
    }

    this.createElement();
  }

  private async createElement() {
    const { default: ApexCharts } = await import("apexcharts");
    window.ApexCharts ||= ApexCharts;

    const options: any = {};

    if (this.annotations) {
      options.annotations = this.annotations;
    }
    if (this.chart) {
      options.chart = this.chart;
    }
    if (this.colors) {
      options.colors = this.colors;
    }
    if (this.dataLabels) {
      options.dataLabels = this.dataLabels;
    }
    if (this.series) {
      options.series = this.series;
    }
    if (this.stroke) {
      options.stroke = this.stroke;
    }
    if (this.labels) {
      options.labels = this.labels;
    }
    if (this.legend) {
      options.legend = this.legend;
    }
    if (this.fill) {
      options.fill = this.fill;
    }
    if (this.tooltip) {
      options.tooltip = this.tooltip;
    }
    if (this.plotOptions) {
      options.plotOptions = this.plotOptions;
    }
    if (this.responsive) {
      options.responsive = this.responsive;
    }
    if (this.markers) {
      options.markers = this.markers;
    }
    if (this.noData) {
      options.noData = this.noData;
    }
    if (this.xaxis) {
      options.xaxis = this.xaxis;
    }
    if (this.yaxis) {
      options.yaxis = this.yaxis;
    }
    if (this.forecastDataPoints) {
      options.forecastDataPoints = this.forecastDataPoints;
    }
    if (this.grid) {
      options.grid = this.grid;
    }
    if (this.states) {
      options.states = this.states;
    }
    if (this.title) {
      options.title = this.title;
    }
    if (this.subtitle) {
      options.subtitle = this.subtitle;
    }
    if (this.theme) {
      options.theme = this.theme;
    }

    this.destroy();

    const chartInstance = this.ngZone.runOutsideAngular(
      () => new ApexCharts(this.chartElement.nativeElement, options)
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
