import { NgModule } from "@angular/core";
import { ChartComponent } from "./chart/chart.component";
import { default as ApexCharts } from "apexcharts";

declare global {
  interface Window {
    ApexCharts: any;
  }
}

window.ApexCharts = ApexCharts;

const declerations = [ChartComponent];

@NgModule({
  declarations: [...declerations],
  imports: [],
  exports: [...declerations]
})
export class NgApexchartsModule {}
