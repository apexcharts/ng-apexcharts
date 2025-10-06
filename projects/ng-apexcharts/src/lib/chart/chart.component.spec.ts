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
      await firstValueFrom(outputToObservable(parentComponent.chart().chartReady));

      expect(fixture.debugElement.query(By.css('svg'))).toBeTruthy();
    });
  });
});

@Component({
  selector: 'mock-conditional-wrapper',
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
  selector: 'mock-conditional-parent',
  template: `
    <mock-conditional-wrapper [show]="show()">
      <apx-chart [chart]="config" [series]="chartSeries"></apx-chart>
    </mock-conditional-wrapper>
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
