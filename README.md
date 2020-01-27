<p align="center">
  <img src="https://apexcharts.com/media/ng-apexcharts.png" height="150" />
</p>

<p align="center">
  <a href="https://github.com/apexcharts/ng-apexcharts/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-brightgreen.svg" alt="License"></a>
  <a href="https://www.npmjs.com/package/ng-apexcharts"><img src="https://img.shields.io/npm/v/ng-apexcharts.svg" alt="ver"></a>
</p>

<p align="center">
  <a href="https://twitter.com/intent/tweet?text=ng-ApexCharts%20An%20Angular%20Chart%20library%20built%20on%20ApexCharts.js&url=https://www.apexcharts.com&hashtags=javascript,charts,angular,apexcharts"><img src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social"> </a>
</p>

<p align="center">Angular wrapper for <a href="https://github.com/apexcharts/apexcharts.js">ApexCharts</a> to build interactive visualizations in Angular.</p>

<p align="center"><a href="https://apexcharts.com/angular-chart-demos/"><img src="https://apexcharts.com/media/apexcharts-banner.png"></a></p>

## Examples

More than 80+ examples of all the chart types with sample codes can be found on the <a href="https://apexcharts.com/angular-chart-demos/">Angular Demos</a> page of the website. Here's a basic <a href="https://codesandbox.io/s/apx-line-basic-o2mwb">line chart</a> example built in codesandbox.

## Download and Installation

1. Install using npm:

```ts
npm install apexcharts ng-apexcharts --save
```

2. Open angular.json and under scripts add:

```ts
"scripts": [
  "node_modules/apexcharts/dist/apexcharts.min.js"
]
```

3. Add ng-apexcharts-module to imports

```ts
imports: [
  BrowserModule,
  FormsModule,
  ReactiveFormsModule,
  NgApexchartsModule,
  ...
]
```

## Usage

In any component you can use the chart using:

```html
<apx-chart [series]="series" [chart]="chart" [title]="title"></apx-chart>
```

You need to provide at least the series and chart attribute to make sure the
chart can get created.

You can also use any other attribute from the following options.

### Options

All options of the chart can be inserted using the attributes.
This is a list of all available attributes:

```ts
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
```

You can visit the [docs](https://apexcharts.com/docs/) to read more about all the options listed above.

### Updating the chart

Changing the attributes will automatically call the relevant update methods of ApexCharts and re-render it.

### Calling core ApexCharts methods

You don't actually need to call updateSeries() or updateOptions() manually. Changing the props will automatically update the chart. But, in certain cases you may need to call these methods, so here's the reference.

| Method                                                                                   | Description                                                                                        |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| <a href="https://apexcharts.com/docs/methods/#updateSeries">updateSeries</a>             | Allows you to update the series array overriding the existing one                                  |
| <a href="https://apexcharts.com/docs/methods/#updateOptions">updateOptions</a>           | Allows you to update the configuration object                                                      |
| <a href="https://apexcharts.com/docs/methods/#toggleSeries">toggleSeries</a>             | Allows you to toggle the visibility of series programatically. Useful when you have custom legend. |
| <a href="https://apexcharts.com/docs/methods/#appendData">appendData</a>                 | Allows you to append new data to the series array.                                                 |
| <a href="https://apexcharts.com/docs/methods/#addtext">addText</a>                       | The addText() method can be used to draw text after chart is rendered.                             |
| <a href="https://apexcharts.com/docs/methods/#addxaxisannotation">addXaxisAnnotation</a> | Draw x-axis annotations after chart is rendered.                                                   |
| <a href="https://apexcharts.com/docs/methods/#addyaxisannotation">addYaxisAnnotation</a> | Draw y-axis annotations after chart is rendered.                                                   |
| <a href="https://apexcharts.com/docs/methods/#addpointannotation">addPointAnnotation</a> | Draw point (xy) annotations after chart is rendered.                                               |

All the methods are proxied through the component so that you dont need to access the DOM by yourself.

Just reference the component as a ViewChild in your Component by using:

```ts
@ViewChild('chartObj') chart: ChartComponent;
```

and changing the template to this:

```html
<apx-chart #chartObj></apx-chart>
```

Now you're able to call methods from your Component.

```javascript
this.chart.toggleSeries("series-1");
```

## How to call the methods of ApexCharts without referencing the chart component?

Sometimes, you may want to call methods of the core ApexCharts library from some other place, and you can do so on `this.$apexcharts` global variable directly. You need to target the chart by <code>chart.id</code> while calling this method

Example

```js
window.ApexCharts.exec("ng-chart-example", "updateSeries", [
  {
    data: [40, 55, 65, 11, 23, 44, 54, 33]
  }
]);
```

In the above method, `ng-chart-example` is the ID of chart, `updateSeries` is the name of the method you want to call and the third parameter is the new Series you want to update.

More info on the `.exec()` method can be found <a href="https://apexcharts.com/docs/methods/#exec">here</a>

All other methods of ApexCharts can be called the same way.

#### Turning off auto update of the series

With the attribute `autoUpdateSeries` you can control if the chart component should call the `updateSeries` function automatically if the series attribute is changed. It is set to true by default, but in a mixed/combo chart, set this attribute to false if you are using and changing the type property in your series. This only has the effect that the whole chart rerenders even if only the series changes.

## Supporting ApexCharts

ApexCharts is an open source project. <br /> You can help by becoming a sponsor on <a href="https://patreon.com/junedchhipa">Patreon</a> or doing a one time donation on <a href="https://paypal.me/junedchhipa">PayPal</a> <br />

<a href="https://patreon.com/junedchhipa"><img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron" /> </a>

## License

ng-ApexCharts is released under MIT license. You are free to use, modify and distribute this software, as long as the copyright header is left intact.

### Submitted by

Special thanks to [Morris Janatzek](http://morrisj.net) for contributing to ApexCharts project by creating this angular wrapper.
