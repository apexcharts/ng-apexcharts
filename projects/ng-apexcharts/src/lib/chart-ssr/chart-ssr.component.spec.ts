import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PLATFORM_ID } from "@angular/core";
import { ChartSSRComponent } from "./chart-ssr.component";
import { ChartSSRService } from "../services/chart-ssr.service";

const FAKE_HTML = "<svg><rect width='100' height='100' /></svg>";

describe("ChartSSRComponent", () => {
  function configureModule(platformId: string) {
    return TestBed.configureTestingModule({
      imports: [ChartSSRComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: platformId },
        {
          provide: ChartSSRService,
          useValue: {
            nextInstanceId: jasmine.createSpy("nextInstanceId").and.returnValue(0),
            renderToHTML: jasmine.createSpy("renderToHTML").and.returnValue(
              Promise.resolve(FAKE_HTML)
            ),
            renderToString: jasmine.createSpy("renderToString").and.returnValue(
              Promise.resolve(FAKE_HTML)
            ),
          },
        },
      ],
    }).compileComponents();
  }

  describe("on the server", () => {
    let fixture: ComponentFixture<ChartSSRComponent>;
    let component: ChartSSRComponent;
    let ssrService: ChartSSRService;

    beforeEach(async () => {
      await configureModule("server");
      fixture = TestBed.createComponent(ChartSSRComponent);
      component = fixture.componentInstance;
      ssrService = TestBed.inject(ChartSSRService);
      fixture.componentRef.setInput("options", {
        chart: { type: "line" },
        series: [{ data: [10, 20, 30] }],
      });
    });

    it("should create the component", () => {
      expect(component).toBeTruthy();
    });

    it("calls renderToHTML with correct options and dimensions on init", async () => {
      fixture.componentRef.setInput("width", 600);
      fixture.componentRef.setInput("height", 400);
      await component.ngOnInit();

      expect(ssrService.renderToHTML).toHaveBeenCalledWith(
        { chart: { type: "line" }, series: [{ data: [10, 20, 30] }] },
        { width: 600, height: 400 }
      );
    });

    it("sets chartHTML via DomSanitizer after renderToHTML resolves", async () => {
      await component.ngOnInit();

      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.innerHTML).toContain("svg");
    });

    it("uses default width (400) and height (300) when not provided", async () => {
      await component.ngOnInit();

      expect(ssrService.renderToHTML).toHaveBeenCalledWith(
        jasmine.any(Object),
        { width: 400, height: 300 }
      );
    });
  });

  describe("on the browser (client)", () => {
    let fixture: ComponentFixture<ChartSSRComponent>;
    let component: ChartSSRComponent;
    let ssrService: ChartSSRService;

    beforeEach(async () => {
      await configureModule("browser");
      fixture = TestBed.createComponent(ChartSSRComponent);
      component = fixture.componentInstance;
      ssrService = TestBed.inject(ChartSSRService);
      fixture.componentRef.setInput("options", { chart: { type: "bar" }, series: [] });
    });

    it("does NOT call renderToHTML on the client", async () => {
      await component.ngOnInit();

      expect(ssrService.renderToHTML).not.toHaveBeenCalled();
    });

    it("leaves chartHTML empty on the client", async () => {
      await component.ngOnInit();
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector("svg")).toBeNull();
    });
  });
});
