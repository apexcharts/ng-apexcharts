import { Component, computed, viewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ChartComponent,
} from "ng-apexcharts";

@Component({
  selector: "app-full-demo",
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ChartComponent],
  template: `
    <section>
      <hgroup>
        <h2>Full bundle demo</h2>
        <p>
          Uses <code>import("apexcharts")</code>: the full client bundle with
          all chart types, animations, tooltips, zoom, and exports included.
          Editing data or adding values/series animates the existing chart in
          place through the <code>updateSeries()</code> fast path; only changing
          the chart type rebuilds it.
        </p>
      </hgroup>

      <div class="chart-layout">
        <div class="chart-preview">
          <apx-chart
            #chart
            [series]="chartSeries()"
            [chart]="chartOptions()"
            [title]="titleOptions"
          />

          <div class="chart-actions">
            <button type="button" class="outline" (click)="downloadPng()">
              Download PNG
            </button>
          </div>
        </div>

        <div class="chart-controls">
          <form [formGroup]="form">
            <fieldset>
              <legend>Chart settings</legend>
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
                <button type="button" class="outline" (click)="addSeries()">
                  + Series
                </button>
                <button type="button" class="outline" (click)="addValue()">
                  + Value
                </button>
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
                        @for (
                          val of getDataControls(i);
                          track val;
                          let y = $index
                        ) {
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
  styles: [
    `
      .chart-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 1.5rem;
        align-items: start;
      }
      @media (max-width: 900px) {
        .chart-layout {
          grid-template-columns: 1fr;
        }
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
      .series-actions button {
        flex: 1;
      }
      .chart-actions {
        display: flex;
        justify-content: flex-end;
      }
      .chart-actions button {
        width: auto;
        margin-bottom: 0;
      }
      details {
        margin-bottom: 0.75rem;
      }
      details summary {
        cursor: pointer;
        font-weight: 600;
      }
    `,
  ],
})
export class FullDemoComponent {
  /** Modern equivalent of the old `@ViewChild()`; used by `downloadPng()`. */
  private readonly chartRef = viewChild.required(ChartComponent);

  readonly form = new UntypedFormGroup({
    type: new UntypedFormControl("line"),
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

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  /**
   * Labels are carried inside the series as `{ x, y }` pairs instead of a
   * separate `[xaxis]="{ categories }"` binding. Adding a value therefore only
   * changes the `series` input, which the chart component applies through
   * ApexCharts' `updateSeries()`: the chart animates in place and the instance
   * is preserved. A bound categories object would make every append look like
   * a structural change and force a full destroy/re-create instead.
   */
  readonly chartSeries = computed<ApexAxisChartSeries>(() => {
    const { series = [], xaxis = [] } = this.formValue();

    return series.map((s: { name: string; data: number[] }) => ({
      name: s.name,
      data: (s.data ?? []).map((y: number, i: number) => ({
        x: xaxis[i] ?? `Label ${i + 1}`,
        y: Number(y) || 0,
      })),
    }));
  });

  /**
   * Structural options get their own `computed` with a content-based `equal`
   * so their references only change when the underlying values do. Without
   * this (for example inline object literals in the template) every change
   * detection pass would produce new references and re-create the chart.
   */
  readonly chartOptions = computed<ApexChart>(
    () => ({
      height: 350,
      type: this.formValue().type,
      zoom: { enabled: true },
    }),
    { equal: (a, b) => a.type === b.type },
  );

  readonly titleOptions: ApexTitleSubtitle = { text: "Monthly Revenue" };

  get series() {
    return this.form.get("series") as UntypedFormArray;
  }

  get xaxis() {
    return this.form.get("xaxis") as UntypedFormArray;
  }

  getDataControls(seriesIndex: number): UntypedFormControl[] {
    return (this.series.controls[seriesIndex].get("data") as UntypedFormArray)
      .controls as UntypedFormControl[];
  }

  addValue() {
    this.series.controls.forEach((c) => {
      (c.get("data") as UntypedFormArray).push(
        new UntypedFormControl(this.rand()),
      );
    });
    this.xaxis.push(new UntypedFormControl(`Label ${this.xaxis.length + 1}`));
  }

  addSeries() {
    this.series.push(
      new UntypedFormGroup({
        name: new UntypedFormControl("New Series"),
        data: new UntypedFormArray(
          this.xaxis.controls.map(() => new UntypedFormControl(this.rand())),
        ),
      }),
    );
  }

  /**
   * Demonstrates calling an ApexCharts method through the component reference,
   * which is the supported alternative to reaching into the DOM.
   */
  async downloadPng() {
    const result = await this.chartRef().dataURI();

    if (!result || !("imgURI" in result)) {
      return;
    }

    const link = document.createElement("a");
    link.href = result.imgURI;
    link.download = "monthly-revenue.png";
    link.click();
  }

  private rand() {
    return Math.round(Math.random() * 100);
  }
}
