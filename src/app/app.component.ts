import {Component, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {ChartComponent} from 'ng-apexcharts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  @ViewChild('firstChart') chart: ChartComponent;

  height = 350;

  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      series: new FormGroup({
        name: new FormControl(''),
        data: new FormArray([
          new FormControl(10),
          new FormControl(17),
          new FormControl(13),
          new FormControl(5)
        ])
      }),
      xaxis: new FormArray([
        new FormControl('Jan'),
        new FormControl('Feb'),
        new FormControl('Mar'),
        new FormControl('Apr')
      ])
    });
  }

  addValue() {
    (<FormArray>this.form.get('series').get('data')).push(new FormControl(10));
    (<FormArray>this.form.get('xaxis')).push(new FormControl('Jan'));
  }

  execute() {
    this.chart.toggleSeries(this.form.value.series.name);
  }
}
