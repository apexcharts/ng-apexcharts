import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { By } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

import { ChartComponent } from './chart.component';

describe('ChartComponent', () => {

  describe('basic', () => {
    let component: ChartComponent;
    let fixture: ComponentFixture<ChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ChartComponent],
        providers: [
          provideZonelessChangeDetection()
        ]
      })
        .compileComponents();

      fixture = TestBed.createComponent(ChartComponent);
      component = fixture.componentInstance;
    });

    it('stays inert when no inputs are provided', async () => {
      const createElementSpy = spyOn(component as any, 'createElement').and.callThrough();

      fixture.detectChanges();
      await fixture.whenStable();

      expect(createElementSpy)
        .withContext('No bound inputs must not construct an empty-config chart')
        .not.toHaveBeenCalled();
      expect(component.chartInstance()).toBeNull();
    });

    it('should create and render', async () => {
      fixture.componentRef.setInput('chart', { type: 'line' });
      fixture.componentRef.setInput('series', [{ name: 'series1', data: [10, 20, 30] }]);
      fixture.componentRef.setInput('xaxis', { categories: ['Jan', 'Feb', 'Mar'] });
      await firstValueFrom(outputToObservable(component.chartReady));
      expect(fixture.debugElement.query(By.css('svg'))).toBeTruthy();
    });

    it('update series does not re-create the chart', async () => {
      fixture.componentRef.setInput('chart', { type: 'line' });
      fixture.componentRef.setInput('series', [{ name: 'series1', data: [10, 20, 27] }]);
      fixture.componentRef.setInput('xaxis', { categories: ['Jan', 'Feb', 'Mar'] });
      await firstValueFrom(outputToObservable(component.chartReady));
      const chart1 = component.chartInstance();
      expect(chart1).toBeTruthy();
      expect(fixture.debugElement.queryAll(By.css('.apexcharts-series')).length).toBe(1);

      const createElementSpy = spyOn(component as any, 'createElement').and.callThrough();

      // Update the series
      fixture.componentRef.setInput('series', [{ name: 'series1', data: [10, 20, 30] }, { name: 'series2', data: [15, 25, 47] }]);
      await fixture.whenStable();

      expect(createElementSpy).not.toHaveBeenCalled();
      const chart2 = component.chartInstance();
      expect(chart2).toBeTruthy();
      expect(chart1).withContext('Chart instances should be the same').toBe(chart2);

      expect(fixture.debugElement.queryAll(By.css('.apexcharts-series')).length).toBe(2);
    });

    it('re-creates the chart when a non-series option changes', async () => {
      fixture.componentRef.setInput('chart', { type: 'line' });
      fixture.componentRef.setInput('series', [{ name: 'series1', data: [10, 20, 30] }]);
      await firstValueFrom(outputToObservable(component.chartReady));
      const chart1 = component.chartInstance();

      fixture.componentRef.setInput('title', { text: 'Updated title' });
      await firstValueFrom(outputToObservable(component.chartReady));

      expect(component.chartInstance())
        .withContext('A structural option change must rebuild the chart')
        .not.toBe(chart1);
    });

    it('re-creates the chart on a series change when autoUpdateSeries is false', async () => {
      fixture.componentRef.setInput('chart', { type: 'line' });
      fixture.componentRef.setInput('autoUpdateSeries', false);
      fixture.componentRef.setInput('series', [{ name: 'series1', data: [10, 20, 30] }]);
      await firstValueFrom(outputToObservable(component.chartReady));
      const chart1 = component.chartInstance();

      fixture.componentRef.setInput('series', [{ name: 'series1', data: [1, 2, 3] }]);
      await firstValueFrom(outputToObservable(component.chartReady));

      expect(component.chartInstance())
        .withContext('autoUpdateSeries=false opts out of the updateSeries fast path')
        .not.toBe(chart1);
    });

    it('creates the chart only once when series and options change in the same tick', async () => {
      const createElementSpy = spyOn(component as any, 'createElement').and.callThrough();

      fixture.componentRef.setInput('chart', { type: 'line' });
      fixture.componentRef.setInput('series', [{ name: 'series1', data: [10, 20, 30] }]);
      await firstValueFrom(outputToObservable(component.chartReady));
      expect(createElementSpy).toHaveBeenCalledTimes(1);

      // Both a structural option and the series change together. The series
      // fast path must collapse into the pending create instead of running too.
      fixture.componentRef.setInput('chart', { type: 'bar' });
      fixture.componentRef.setInput('series', [{ name: 'series1', data: [4, 5, 6] }]);
      await firstValueFrom(outputToObservable(component.chartReady));

      expect(createElementSpy).toHaveBeenCalledTimes(2);
    });

    it('picks up the latest inputs when a create is already queued', async () => {
      fixture.componentRef.setInput('chart', { type: 'line' });
      fixture.componentRef.setInput('series', [{ name: 'series1', data: [10, 20, 30] }]);
      // Changed again before the queued afterNextRender create has run.
      fixture.componentRef.setInput('series', [
        { name: 'series1', data: [10, 20, 30] },
        { name: 'series2', data: [15, 25, 47] },
      ]);
      await firstValueFrom(outputToObservable(component.chartReady));

      expect(fixture.debugElement.queryAll(By.css('.apexcharts-series')).length).toBe(2);
    });
  });

  describe('when used inside conditional content projection component', () => {
    let fixture: ComponentFixture<MockConditionalParentComponent>;
    let parentComponent: MockConditionalParentComponent;

    beforeEach(async () => {
      window.onerror = err => {
        fail(err);
      };

      await TestBed.configureTestingModule({
        imports: [MockConditionalParentComponent],
        providers: [
          provideZonelessChangeDetection()
        ]
      })
        .compileComponents();

      fixture = TestBed.createComponent(MockConditionalParentComponent);
      parentComponent = fixture.componentInstance;
    });

    afterEach(() => {
      window.onerror = null;
    });

    it('should not crash while created on a disconnected node', async () => {
      expect(parentComponent).toBeTruthy();
      expect(parentComponent.chart()).toBeTruthy();

      const createElementSpy = spyOn(parentComponent.chart() as any, 'createElement').and.callThrough();
      await fixture.whenStable()

      expect(createElementSpy).toHaveBeenCalled();
      // Wait for the promise to confirm that it did not throw
      await createElementSpy.calls.mostRecent().returnValue;
    });

    it('should render when it gets connected', async () => {
      await fixture.whenStable()
      expect(parentComponent.chart()).toBeTruthy();

      fixture.componentRef.setInput('show', true);
      await firstValueFrom(outputToObservable(parentComponent.chart()!.chartReady));

      expect(fixture.debugElement.query(By.css('svg'))).toBeTruthy();
    });
  });
});

@Component({
  selector: 'apx-mock-conditional-wrapper',
  template: `
  @if (show()) {
    <ng-content></ng-content>
  }
  `,
})
class MockConditionalWrapperComponent {
  show = input.required<boolean>();
}

@Component({
  selector: 'apx-mock-conditional-parent',
  template: `
    <apx-mock-conditional-wrapper [show]="show()">
      <apx-chart [chart]="config" [series]="chartSeries"></apx-chart>
    </apx-mock-conditional-wrapper>
  `,
  imports: [ChartComponent, MockConditionalWrapperComponent],
})
class MockConditionalParentComponent {
  public show = input(false);

  public chart = viewChild(ChartComponent);

  protected config = {
    type: 'line',
  };

  protected chartSeries = [
    { name: 'series1', data: [31, 40, 28, 51, 42, 109, 100] },
  ];
}
