import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexStroke, ApexTheme, ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from '../model/apex-types';
import { asapScheduler } from 'rxjs';

declare var ApexCharts: any;

@Component({
  selector: 'apx-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() chart: ApexChart;
  @Input() annotations: ApexAnnotations;
  @Input() colors: string[];
  @Input() dataLabels: ApexDataLabels = {enabled: false};
  @Input() series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  @Input() stroke: ApexStroke = {curve: 'straight'};
  @Input() labels: string[];
  @Input() legend: ApexLegend;
  @Input() fill: ApexFill;
  @Input() tooltip: ApexTooltip;
  @Input() plotOptions: ApexPlotOptions;
  @Input() responsive: ApexResponsive[];
  @Input() xaxis: ApexXAxis;
  @Input() yaxis: ApexYAxis | ApexYAxis[];

  @Input() grid: ApexGrid = {
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5
    }
  };

  @Input() states: ApexStates;
  @Input() title: ApexTitleSubtitle;
  @Input() subtitle: ApexTitleSubtitle;
  @Input() theme: ApexTheme;

  @Input() autoUpdateSeries = true;

  @ViewChild('chart') private chartElement: ElementRef;
  private chartObj: any;

  ngOnInit() {
    asapScheduler.schedule(() => {
      this.createElement();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      if (this.autoUpdateSeries && Object.keys(changes).filter(c => c !== 'series').length === 0) {
        this.updateSeries(this.series, true);
        return;
      }

      this.createElement();
    }, 0);
  }

  private createElement() {
    const options: any = {};

    if (this.annotations) { options.annotations = this.annotations; }
    if (this.chart) { options.chart = this.chart; }
    if (this.colors) { options.colors = this.colors; }
    if (this.dataLabels) { options.dataLabels = this.dataLabels; }
    if (this.series) { options.series = this.series; }
    if (this.stroke) { options.stroke = this.stroke; }
    if (this.labels) { options.labels = this.labels; }
    if (this.legend) { options.legend = this.legend; }
    if (this.fill) { options.fill = this.fill; }
    if (this.tooltip) { options.tooltip = this.tooltip; }
    if (this.plotOptions) { options.plotOptions = this.plotOptions; }
    if (this.responsive) { options.responsive = this.responsive; }
    if (this.xaxis) { options.xaxis = this.xaxis; }
    if (this.yaxis) { options.yaxis = this.yaxis; }
    if (this.grid) { options.grid = this.grid; }
    if (this.states) { options.states = this.states; }
    if (this.title) { options.title = this.title; }
    if (this.subtitle) { options.subtitle = this.subtitle; }
    if (this.theme) { options.theme = this.theme; }

    if (this.chartObj) {
      this.chartObj.destroy();
    }

    this.chartObj = new ApexCharts(
      this.chartElement.nativeElement,
      options
    );

    this.render();
  }

  public render(): Promise<void> {
    return this.chartObj.render();
  }

  public updateOptions(options: any, redrawPaths: boolean, animate: boolean): Promise<void> {
    return this.chartObj.updateOptions(options, redrawPaths, animate);
  }

  public updateSeries(newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries, animate: boolean) {
    this.chartObj.updateSeries(newSeries, animate);
  }

  public toggleSeries(seriesName: string) {
    this.chartObj.toggleSeries(seriesName);
  }

  public addXaxisAnnotation(options: any, pushToMemory?: boolean, context?: any) {
    this.chartObj.addXaxisAnnotation(options, pushToMemory, context);
  }

  public addYaxisAnnotation(options: any, pushToMemory?: boolean, context?: any) {
    this.chartObj.addYaxisAnnotation(options, pushToMemory, context);
  }

  public addPointAnnotation(options: any, pushToMemory?: boolean, context?: any) {
    this.chartObj.addPointAnnotation(options, pushToMemory, context);
  }

  public addText(options: any, pushToMemory?: boolean, context?: any) {
    this.chartObj.addText(options, pushToMemory, context);
  }

  public dataURI() {
    return this.chartObj.dataURI();
  }
}
