import { NgModule } from "@angular/core";
import { ChartComponent } from "./chart/chart.component";
import { ChartCoreComponent } from "./chart-core/chart-core.component";
import { ChartSSRComponent } from "./chart-ssr/chart-ssr.component";
import { ChartHydrateComponent } from "./chart-hydrate/chart-hydrate.component";

const declarations = [ChartComponent, ChartCoreComponent, ChartSSRComponent, ChartHydrateComponent];

@NgModule({
  imports: [declarations],
  exports: [declarations],
})
export class NgApexchartsModule {}
