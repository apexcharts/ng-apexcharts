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
import { SeriesPipe } from "../../series.pipe";

@Component({
  selector: "app-full-demo",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ChartComponent, SeriesPipe],
  template: `
    <section>
      <hgroup>
        <h2>Full bundle demo</h2>
        <p>
          Uses <code>import("apexcharts")</code> — the full client bundle with all chart types,
          animations, tooltips, zoom, and exports included.
        </p>
      </hgroup>

      <div class="chart-layout">
        <div class="chart-preview">
          <apx-chart
            #chart
            [series]="form.value.series | series : form.value.type"
            [xaxis]="{ categories: form.value.xaxis }"
            [chart]="{
              height: form.value.height,
              type: form.value.type,
              zoom: { enabled: true },
              shadow: { enabled: true, color: '#000', top: 18, left: 7, blur: 10, opacity: 1 }
            }"
            [title]="{ text: form.value.title }"
            [autoUpdateSeries]="false"
          />
        </div>

        <div class="chart-controls">
          <form [formGroup]="form">
            <fieldset>
              <legend>Chart settings</legend>
              <label>
                Title
                <input type="text" formControlName="title" />
              </label>
              <label>
                Height (px)
                <input type="number" formControlName="height" />
              </label>
              <label>
                Chart type
                <select formControlName="type">
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                  <option value="bar">Bar</option>
                  <option value="radar">Radar</option>
                </select>
              </label>
            </fieldset>

            <fieldset>
              <legend>Data</legend>
              <div class="series-actions">
                <button type="button" class="outline" (click)="addSeries()">+ Series</button>
                <button type="button" class="outline" (click)="addValue()">+ Value</button>
              </div>

              <div formArrayName="series">
                @for (s of series.controls; track s; let i = $index) {
                  <details open>
                    <summary>Series {{ i + 1 }}</summary>
                    <div [formGroupName]="i">
                      <label>
                        Name
                        <input type="text" formControlName="name" />
                      </label>
                      <div formArrayName="data">
                        @for (val of getDataControls(i); track val; let y = $index) {
                          <label>
                            Value {{ y + 1 }}
                            <input type="number" [formControlName]="y" />
                          </label>
                        }
                      </div>
                    </div>
                  </details>
                }
              </div>

            </fieldset>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .chart-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
      align-items: start;
    }
    @media (max-width: 900px) {
      .chart-layout { grid-template-columns: 1fr; }
    }
    .chart-controls {
      max-height: 80vh;
      overflow-y: auto;
    }
    .series-actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .series-actions button { flex: 1; }
    details { margin-bottom: 0.75rem; }
    details summary { cursor: pointer; font-weight: 600; }
  `],
})
export class FullDemoComponent {
  @ViewChild("chart", { static: true }) chart: ChartComponent;

  form: UntypedFormGroup;

  get series() {
    return this.form.get("series") as UntypedFormArray;
  }

  get xaxis() {
    return this.form.get("xaxis") as UntypedFormArray;
  }

  getDataControls(seriesIndex: number): UntypedFormControl[] {
    return (this.series.controls[seriesIndex].get("data") as UntypedFormArray).controls as UntypedFormControl[];
  }

  constructor() {
    this.form = new UntypedFormGroup({
      title: new UntypedFormControl("Monthly Revenue"),
      type: new UntypedFormControl("line"),
      height: new UntypedFormControl(350),
      series: new UntypedFormArray([
        new UntypedFormGroup({
          name: new UntypedFormControl("Series A"),
          data: new UntypedFormArray([
            new UntypedFormControl(this.rand()),
            new UntypedFormControl(this.rand()),
            new UntypedFormControl(this.rand()),
            new UntypedFormControl(this.rand()),
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
    this.series.controls.forEach((c) => {
      (c.get("data") as UntypedFormArray).push(new UntypedFormControl(this.rand()));
    });
    this.xaxis.push(new UntypedFormControl("Label"));
  }

  addSeries() {
    this.series.push(
      new UntypedFormGroup({
        name: new UntypedFormControl("New Series"),
        data: new UntypedFormArray(
          this.xaxis.controls.map(() => new UntypedFormControl(this.rand()))
        ),
      })
    );
  }

  private rand() {
    return Math.round(Math.random() * 100);
  }
}
