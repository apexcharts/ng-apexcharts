<p align="center">
  <img src="https://morrisj.net/storage/icons/ng-apexcharts/icon.svg" width="180" />
</p>

# ng-apexcharts

ng-apexcharts is a wrapper for [apexcharts](https://apexcharts.com/) for angular.
It introduces one simple component that enables you to use apexcharts
in an angular project.

For a demo checkout: <a href="https://ngapexcharts-demo.stackblitz.io/" target="_blank">Stackblitz example</a>

## Installation

1. Install using npm:

```` ts
npm install apexcharts ng-apexcharts --save
````

2. Open angular.json and under scripts add:

```` ts
"scripts": [
  "node_modules/apexcharts/dist/apexcharts.min.js"
]
```` 

3. Add ng-apexcharts-module to imports

```` ts
imports: [
  BrowserModule,
  FormsModule,
  ReactiveFormsModule,
  NgApexchartsModule,
  ...
]
````

## Usage

In any component you can use the chart using:

```` html
<apx-chart [series]="series" [chart]="chart" [title]="title"></apx-chart>
````

You need to provide at least the series and chart attribute to make sure the
chart can get created.

You can also use any other attribute from the following options.

### Options

All options of the chart can inserted using the attributes.
This is a list of all available attributes:

```` ts
@Input() chart: ApexChart;
@Input() annotations: ApexAnnotations;
@Input() colors: string[];
@Input() dataLabels: ApexDataLabels;
@Input() series: ApexAxisChartSeries | ApexNonAxisChartSeries;
@Input() stroke: ApexStroke;
@Input() labels: string[];
@Input() legend: ApexLegend;
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
````

#### Auto update series

With the attribute `autoUpdateSeries` you can control if the chart component should
call the `updateSeries` function automatically if the series attribute is changed.
Set this attribute to false if you are using and changig the type property in your
series for a mixed chart. This only has the effect that the whole chart rerenders
even if only the series changes.

### Use methods

For a basic usage of the charts you dont need to use the methods of the chart.

But if you want to toggle a series for example you need to call them. All methods
are proxied through the component so that you dont need to access the DOM by
yourself.

Just reference the component as a ViewChild in your Component by using:
```` ts
@ViewChild('chartObj') chart: ChartComponent;
````

and chaning the template to this:
```` html
<apx-chart #chartObj></apx-chart>
````

Now you're able to call methods from your Component.

## Author

[Morris Janatzek](http://morrisj.net) ([morrisjdev](https://github.com/morrisjdev))
