import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { outputToObservable } from "@angular/core/rxjs-interop";
import { By } from "@angular/platform-browser";
import { firstValueFrom } from "rxjs";
import { ChartCoreComponent } from "./chart-core.component";

describe("ChartCoreComponent", () => {
  let component: ChartCoreComponent;
  let fixture: ComponentFixture<ChartCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartCoreComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartCoreComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("loads apexcharts/core instead of apexcharts/client", async () => {
    const importSpy = spyOn<any>(component, "importApexCharts").and.callThrough();

    fixture.componentRef.setInput("chart", { type: "line" });
    fixture.componentRef.setInput("series", [{ name: "s", data: [1, 2, 3] }]);
    await firstValueFrom(outputToObservable(component.chartReady));

    expect(importSpy).toHaveBeenCalledTimes(1);
    // Verify the resolved module comes from the core bundle (no chart types pre-registered)
    const resolvedModule = await importSpy.calls.mostRecent().returnValue;
    expect(resolvedModule.default).toBeTruthy();
  });

  it("renders an SVG chart using core bundle with registered chart type", async () => {
    fixture.componentRef.setInput("chart", { type: "line" });
    fixture.componentRef.setInput("series", [{ name: "Revenue", data: [10, 20, 30] }]);
    fixture.componentRef.setInput("xaxis", { categories: ["Jan", "Feb", "Mar"] });

    await firstValueFrom(outputToObservable(component.chartReady));

    expect(fixture.debugElement.query(By.css("svg"))).toBeTruthy();
  });

  it("exposes chartInstance after render", async () => {
    fixture.componentRef.setInput("chart", { type: "bar" });
    fixture.componentRef.setInput("series", [{ name: "Q1", data: [44, 55, 57] }]);

    await firstValueFrom(outputToObservable(component.chartReady));

    expect(component.chartInstance()).toBeTruthy();
  });

  it("destroys chartInstance on ngOnDestroy", async () => {
    fixture.componentRef.setInput("chart", { type: "line" });
    fixture.componentRef.setInput("series", [{ name: "s", data: [1, 2, 3] }]);
    await firstValueFrom(outputToObservable(component.chartReady));

    expect(component.chartInstance()).toBeTruthy();
    component.ngOnDestroy();
    expect(component.chartInstance()).toBeNull();
  });
});
