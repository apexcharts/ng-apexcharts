import { NgModule } from '@angular/core';
import { ChartComponent } from './chart/chart.component';

const declerations = [
  ChartComponent
];

@NgModule({
  declarations: [
    ...declerations
  ],
  imports: [
  ],
  exports: [
    ...declerations
  ]
})
export class NgApexchartsModule { }
