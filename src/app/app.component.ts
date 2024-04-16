import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormArray
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NgFor, JsonPipe } from '@angular/common';
import { ChartComponent, ChartType } from 'ng-apexcharts';

import { SeriesPipe } from './series.pipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  standalone: true,
  imports: [
    ChartComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    RouterOutlet,
    JsonPipe,
    SeriesPipe
  ]
})
export class AppComponent {
  public readonly form = new FormGroup({
    title: new FormControl('Basic Chart'),
    type: new FormControl<ChartType>('line'),
    height: new FormControl(350),
    series: new FormArray([
      new FormGroup({
        name: new FormControl('Series'),
        type: new FormControl('line'),
        data: new FormArray([
          new FormControl(this.getRandomArbitrary(0, 100)),
          new FormControl(this.getRandomArbitrary(0, 100)),
          new FormControl(this.getRandomArbitrary(0, 100)),
          new FormControl(this.getRandomArbitrary(0, 100))
        ])
      })
    ]),
    xaxis: new FormArray([
      new FormControl('Jan'),
      new FormControl('Feb'),
      new FormControl('Mar'),
      new FormControl('Apr')
    ])
  });

  private det = 0;


  get series() {
    return this.form.get('series') as FormArray;
  }

  get xaxis() {
    return this.form.get('xaxis') as FormArray;
  }

  changeDet(): boolean {
    console.log(`change${this.det++}`);
    return false;
  }

  addValue() {
    this.series.controls.forEach((serie) => {
      const data = serie.get('data') as FormArray;

      data.push(new FormControl(this.getRandomArbitrary(0, 100)));
    });

    this.xaxis.push(new FormControl('Jan'));
  }

  addSeries(): void {
    this.series.push(new FormGroup({
      name: new FormControl('Series'),
      type: new FormControl('line'),
      data: new FormArray([
        new FormControl(this.getRandomArbitrary(0, 100)),
        new FormControl(this.getRandomArbitrary(0, 100)),
        new FormControl(this.getRandomArbitrary(0, 100)),
        new FormControl(this.getRandomArbitrary(0, 100))
      ])
    }));
  }
  
  onChartReady(event: any) {
    console.log('Chart ready', event);
  }

  private getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
