import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
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
} from "../model/apex-types";
import { asapScheduler } from "rxjs";

import ApexCharts from "apexcharts";

@Component({
  selector: "apx-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"],
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() chart: ApexChart;
  @Input() annotations: ApexAnnotations;
  @Input() colors: any[];
  @Input() dataLabels: ApexDataLabels;
  @Input() series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  @Input() stroke: ApexStroke;
  @Input() labels: string[];
  @Input() legend: ApexLegend;
  @Input() markers: ApexMarkers;
  @Input() noData: ApexNoData;
  @Input() fill: ApexFill;
  @Input() tooltip: ApexTooltip;
  @Input() plotOptions: ApexPlotOptions;
  @Input() responsive: ApexResponsive[];
  @Input() xaxis: ApexXAxis;
  @Input() yaxis: ApexYAxis | ApexYAxis[];
  @Input() grid: ApexGrid;
  @Input() states: ApexStates;
  @Input() title: ApexTitleSubtitle;
  @Input() subtitle: ApexTitleSubtitle;
  @Input() theme: ApexTheme;

  @Input() autoUpdateSeries = true;

  @ViewChild("chart", { static: true }) private chartElement: ElementRef;
  private chartObj: any;

  ngOnInit() {
    asapScheduler.schedule(() => {
      this.createElement();
    });
  }

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

  ngOnDestroy() {
    if (this.chartObj) {
      this.chartObj.destroy();
    }
  }

  private createElement() {
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

    if (this.chartObj) {
      this.chartObj.destroy();
    }

    this.chartObj = new ApexCharts(this.chartElement.nativeElement, options);

    this.render();
  }

  public render(): Promise<void> {
    return this.chartObj.render();
  }

  public updateOptions(
    options: any,
    redrawPaths?: boolean,
    animate?: boolean,
    updateSyncedCharts?: boolean
  ): Promise<void> {
    return this.chartObj.updateOptions(
      options,
      redrawPaths,
      animate,
      updateSyncedCharts
    );
  }

  public updateSeries(
    newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries,
    animate?: boolean
  ) {
    this.chartObj.updateSeries(newSeries, animate);
  }

  public appendSeries(
    newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries,
    animate?: boolean
  ) {
    this.chartObj.appendSeries(newSeries, animate);
  }

  public appendData(newData: any[]) {
    this.chartObj.appendData(newData);
  }

  public toggleSeries(seriesName: string): any {
    return this.chartObj.toggleSeries(seriesName);
  }

  public showSeries(seriesName: string) {
    this.chartObj.showSeries(seriesName);
  }

  public hideSeries(seriesName: string) {
    this.chartObj.hideSeries(seriesName);
  }

  public resetSeries() {
    this.chartObj.resetSeries();
  }

  public zoomX(min: number, max: number) {
    this.chartObj.zoomX(min, max);
  }

  public toggleDataPointSelection(
    seriesIndex: number,
    dataPointIndex?: number
  ) {
    this.chartObj.toggleDataPointSelection(seriesIndex, dataPointIndex);
  }

  public destroy() {
    this.chartObj.destroy();
  }

  public setLocale(localeName?: string) {
    this.chartObj.setLocale(localeName);
  }

  public paper() {
    this.chartObj.paper();
  }

  public addXaxisAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ) {
    this.chartObj.addXaxisAnnotation(options, pushToMemory, context);
  }

  public addYaxisAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ) {
    this.chartObj.addYaxisAnnotation(options, pushToMemory, context);
  }

  public addPointAnnotation(
    options: any,
    pushToMemory?: boolean,
    context?: any
  ) {
    this.chartObj.addPointAnnotation(options, pushToMemory, context);
  }

  public removeAnnotation(id: string, options?: any) {
    this.chartObj.removeAnnotation(id, options);
  }

  public clearAnnotations(options?: any) {
    this.chartObj.clearAnnotations(options);
  }

  public dataURI(options?: any): Promise<void> {
    return this.chartObj.dataURI(options);
  }
}
