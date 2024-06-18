import { Component, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { ChartComponent } from "ng-apexcharts";

import { SeriesPipe } from "./series.pipe";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChartComponent,
    SeriesPipe,
  ],
})
export class AppComponent {
  @ViewChild("chart", { static: true }) chart: ChartComponent;

  form: UntypedFormGroup;

  public get series() {
    return this.form.get("series") as UntypedFormArray;
  }

  public get xaxis() {
    return this.form.get("xaxis") as UntypedFormArray;
  }
  private det = 0;
  changeDet(): boolean {
    console.log(`change${this.det++}`);
    return false;
  }

  constructor() {
    this.form = new UntypedFormGroup({
      title: new UntypedFormControl("Basic Chart"),
      type: new UntypedFormControl("line"),
      height: new UntypedFormControl(350),
      series: new UntypedFormArray([
        new UntypedFormGroup({
          name: new UntypedFormControl("Series"),
          type: new UntypedFormControl("line"),
          data: new UntypedFormArray([
            new UntypedFormControl(this.getRandomArbitrary(0, 100)),
            new UntypedFormControl(this.getRandomArbitrary(0, 100)),
            new UntypedFormControl(this.getRandomArbitrary(0, 100)),
            new UntypedFormControl(this.getRandomArbitrary(0, 100)),
          ]),
        }),
      ]),
      xaxis: new UntypedFormArray([
        new UntypedFormControl("Jan"),
        new UntypedFormControl("Feb"),
        new UntypedFormControl("Mar"),
        new UntypedFormControl("Apr"),
      ]),
    });
  }

  addValue() {
    (<UntypedFormArray>this.form.get("series")).controls.forEach((c) => {
      (<UntypedFormArray>c.get("data")).push(
        new UntypedFormControl(this.getRandomArbitrary(0, 100))
      );
    });
    (<UntypedFormArray>this.form.get("xaxis")).push(
      new UntypedFormControl("Jan")
    );
  }

  addSeries() {
    (<UntypedFormArray>this.form.get("series")).push(
      new UntypedFormGroup({
        name: new UntypedFormControl("Series"),
        type: new UntypedFormControl("line"),
        data: new UntypedFormArray([
          new UntypedFormControl(this.getRandomArbitrary(0, 100)),
          new UntypedFormControl(this.getRandomArbitrary(0, 100)),
          new UntypedFormControl(this.getRandomArbitrary(0, 100)),
          new UntypedFormControl(this.getRandomArbitrary(0, 100)),
        ]),
      })
    );
  }

  onChartReady(event: any) {
    console.log("Chart ready", event);
  }

  private getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
}
