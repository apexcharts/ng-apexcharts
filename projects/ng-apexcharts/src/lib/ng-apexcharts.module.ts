import { NgModule } from "@angular/core";
import { ChartComponent } from "./chart/chart.component";

const declarations = [ChartComponent];

@NgModule({
  imports: [declarations],
  exports: [declarations],
})
export class NgApexchartsModule {}
