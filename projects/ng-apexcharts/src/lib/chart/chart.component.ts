import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  NgZone,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexMarkers,
  ApexNoData,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexForecastDataPoints,
  ApexOptions
} from '../model/apex-types';
import { asapScheduler } from 'rxjs';

import type ApexCharts from 'apexcharts';

declare global {
  interface Window {
    ApexCharts: any;
  }
}

@Component({
  selector: 'apx-chart',
  template: '<div #chart></div>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnChanges, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @Input()
  public chart!: ApexChart;

  @Input()
  public annotations!: ApexAnnotations;

  @Input()
  public colors!: any[];

  @Input()
  public dataLabels!: ApexDataLabels;

  @Input()
  public series!: ApexAxisChartSeries | ApexNonAxisChartSeries;

  @Input()
  public stroke!: ApexStroke;

  @Input()
  public labels!: string[];

  @Input()
  public legend!: ApexLegend;

  @Input()
  public markers!: ApexMarkers;

  @Input()
  public noData!: ApexNoData;

  @Input()
  public fill!: ApexFill;

  @Input()
  public tooltip!: ApexTooltip;

  @Input()
  public plotOptions!: ApexPlotOptions;

  @Input()
  public responsive!: ApexResponsive[];

  @Input()
  public xaxis!: ApexXAxis;

  @Input()
  public yaxis!: ApexYAxis | ApexYAxis[];

  @Input()
  public forecastDataPoints!: ApexForecastDataPoints;

  @Input()
  public grid!: ApexGrid;

  @Input()
  public states!: ApexStates;

  @Input()
  public title!: ApexTitleSubtitle;

  @Input()
  public subtitle!: ApexTitleSubtitle;

  @Input()
  public theme!: ApexTheme;

  @Input()
  public autoUpdateSeries = true;

  @ViewChild('chart', { static: true })
  public readonly chartElement!: ElementRef;

  private chartObj?: ApexCharts;
  private hasPendingLoad = false;

  ngOnChanges(changes: SimpleChanges): void {
    asapScheduler.schedule(() => {
      if (
        this.autoUpdateSeries &&
        Object.keys(changes).filter((c) => c !== "series").length === 0
      ) {
        this.updateSeries(this.series, true);
        return;
      }

      this.createElement();
    });
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private createElement(): void {
    // Do not run on server
    if (typeof window === 'undefined' || this.hasPendingLoad) {
      return;
    }

    this.hasPendingLoad = true;
    this.ngZone.runOutsideAngular(async () => {
      this.destroy();

      const ApexCharts = (await import('apexcharts')).default;
      const options = this.buildOptions();

      this.chartObj = new ApexCharts(this.chartElement.nativeElement, options);

      window.ApexCharts = ApexCharts;

      this.render();
      this.hasPendingLoad = false;
    });
  }

  render(): Promise<void>|undefined {
    return this.ngZone.runOutsideAngular(() => this.chartObj?.render());
  }

  updateOptions(
    options: any,
    redrawPaths?: boolean,
    animate?: boolean,
    updateSyncedCharts?: boolean
  ): Promise<void>|undefined {
    return this.ngZone.runOutsideAngular(() => this.chartObj?.updateOptions(
      options,
      redrawPaths,
      animate,
      updateSyncedCharts
    ));
  }

  updateSeries(
    newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries,
    animate?: boolean
  ): Promise<void>|undefined {
    return this.ngZone.runOutsideAngular(() => this.chartObj?.updateSeries(newSeries, animate));
  }

  appendSeries(
    newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries,
    animate?: boolean
  ): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.appendSeries(newSeries, animate));
  }

  appendData(newData: any[]): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.appendData(newData));
  }

  toggleSeries(seriesName: string): Promise<void> {
    return this.ngZone.runOutsideAngular(() => this.chartObj?.toggleSeries(seriesName));
  }

  showSeries(seriesName: string): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.showSeries(seriesName));
  }

  hideSeries(seriesName: string): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.hideSeries(seriesName));
  }

  resetSeries(): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.resetSeries());
  }

  zoomX(min: number, max: number): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.zoomX(min, max));
  }

  toggleDataPointSelection(
    seriesIndex: number,
    dataPointIndex?: number
  ): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.toggleDataPointSelection(seriesIndex, dataPointIndex));
  }

  destroy(): void {
    this.chartObj?.destroy();
  }

  setLocale(localeName: string): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.setLocale(localeName));
  }

  paper(): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.paper());
  }

  addXaxisAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.addXaxisAnnotation(options, pushToMemory, context));
  }

  addYaxisAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.addYaxisAnnotation(options, pushToMemory, context));
  }

  addPointAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.addPointAnnotation(options, pushToMemory, context));
  }

  removeAnnotation(id: string, options?: any): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.removeAnnotation(id, options));
  }

  clearAnnotations(options?: any): void {
    this.ngZone.runOutsideAngular(() => this.chartObj?.clearAnnotations(options));
  }

  dataURI(options?: any): Promise<{ imgURI: string } | { blob: Blob }>|undefined {
    return this.chartObj?.dataURI(options);
  }

  private buildOptions(): ApexOptions {
    const options: ApexOptions = {};

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

    return options;
  }
}
