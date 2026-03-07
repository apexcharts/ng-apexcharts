import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PLATFORM_ID, provideZonelessChangeDetection } from "@angular/core";
import { ChartHydrateComponent } from "./chart-hydrate.component";

// Stub for the hydrate function returned by apexcharts/ssr.
const mockHydrate = jasmine.createSpy("hydrate");
const mockDestroy = jasmine.createSpy("destroy");
const mockChartObj = { destroy: mockDestroy };

const fakeSSRModule = { default: { hydrate: mockHydrate } };

describe("ChartHydrateComponent", () => {
  function configureModule(platformId: string) {
    return TestBed.configureTestingModule({
      imports: [ChartHydrateComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    }).compileComponents();
  }

  describe("on the browser (client)", () => {
    let fixture: ComponentFixture<ChartHydrateComponent>;
    let component: ChartHydrateComponent;
    let ssrSibling: HTMLElement | null = null;

    /** Insert a [data-apexcharts-hydrate] sibling before the component host element. */
    function addSsrSibling(): HTMLElement {
      const host = fixture.nativeElement as HTMLElement;
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-apexcharts-hydrate", "");
      host.parentElement!.insertBefore(wrapper, host);
      ssrSibling = wrapper;
      return wrapper;
    }

    beforeEach(async () => {
      mockHydrate.calls.reset();
      mockDestroy.calls.reset();
      mockHydrate.and.returnValue(mockChartObj);

      await configureModule("browser");
      fixture = TestBed.createComponent(ChartHydrateComponent);
      component = fixture.componentInstance;
    });

    afterEach(() => {
      ssrSibling?.remove();
      ssrSibling = null;
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("calls ApexCharts.hydrate with the [data-apexcharts-hydrate] element and clientOptions on init", async () => {
      spyOn<any>(component, "importClientModule").and.returnValue(Promise.resolve(fakeSSRModule));
      const ssrEl = addSsrSibling();
      const clientOptions = { chart: { animations: { enabled: true } } };
      fixture.componentRef.setInput("clientOptions", clientOptions);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockHydrate).toHaveBeenCalledOnceWith(ssrEl, clientOptions);
    });

    it("uses empty clientOptions by default", async () => {
      spyOn<any>(component, "importClientModule").and.returnValue(Promise.resolve(fakeSSRModule));
      addSsrSibling();

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockHydrate).toHaveBeenCalledOnceWith(jasmine.any(HTMLElement), {});
    });

    it("calls destroy on the chart object when the component is destroyed", async () => {
      spyOn<any>(component, "importClientModule").and.returnValue(Promise.resolve(fakeSSRModule));
      addSsrSibling();

      fixture.detectChanges();
      await fixture.whenStable();
      component.ngOnDestroy();

      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    it("does not throw when destroyed before hydration completes", () => {
      // ngOnDestroy called without detectChanges — chartObj is null
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it("logs warning and skips hydration when no [data-apexcharts-hydrate] element is found", async () => {
      const warnSpy = spyOn(console, "warn");
      spyOn<any>(component, "importClientModule").and.returnValue(Promise.resolve(fakeSSRModule));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(warnSpy).toHaveBeenCalled();
      expect(mockHydrate).not.toHaveBeenCalled();
    });

    it("logs error without throwing when ApexCharts.hydrate throws", async () => {
      const consoleSpy = spyOn(console, "error");
      addSsrSibling();
      const throwingHydrate = jasmine.createSpy("hydrate").and.throwError(
        "No server-rendered chart found"
      );
      spyOn<any>(component, "importClientModule").and.returnValue(
        Promise.resolve({ default: { hydrate: throwingHydrate } })
      );

      fixture.detectChanges();
      await fixture.whenStable();

      expect(consoleSpy).toHaveBeenCalled();
    });

    it("nullifies chartObj after destroy to prevent double-destroy", async () => {
      spyOn<any>(component, "importClientModule").and.returnValue(Promise.resolve(fakeSSRModule));
      addSsrSibling();

      fixture.detectChanges();
      await fixture.whenStable();
      component.ngOnDestroy();
      component.ngOnDestroy(); // Second call must not call destroy again

      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });
  });

  describe("on the server", () => {
    let fixture: ComponentFixture<ChartHydrateComponent>;
    let component: ChartHydrateComponent;

    beforeEach(async () => {
      mockHydrate.calls.reset();

      await configureModule("server");
      fixture = TestBed.createComponent(ChartHydrateComponent);
      component = fixture.componentInstance;
    });

    it("does NOT call ApexCharts.hydrate on the server", async () => {
      const importSpy = spyOn<any>(component, "importClientModule").and.returnValue(
        Promise.resolve(fakeSSRModule)
      );

      fixture.detectChanges();
      await fixture.whenStable();

      expect(importSpy).not.toHaveBeenCalled();
      expect(mockHydrate).not.toHaveBeenCalled();
    });
  });
});
