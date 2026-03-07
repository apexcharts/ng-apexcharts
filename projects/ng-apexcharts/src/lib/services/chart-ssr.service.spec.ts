import { TestBed } from "@angular/core/testing";
import { ChartSSRService } from "./chart-ssr.service";

// Shared stubs — reset between each test.
const mockRenderToHTML = jasmine.createSpy("renderToHTML").and.returnValue(
  Promise.resolve("<div>chart-html</div>")
);
const mockRenderToString = jasmine.createSpy("renderToString").and.returnValue(
  Promise.resolve("<svg>chart-svg</svg>")
);

const fakeSSRModule = {
  default: { renderToHTML: mockRenderToHTML, renderToString: mockRenderToString },
};

describe("ChartSSRService", () => {
  let service: ChartSSRService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChartSSRService],
    });
    service = TestBed.inject(ChartSSRService);

    mockRenderToHTML.calls.reset();
    mockRenderToString.calls.reset();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("renderToHTML", () => {
    it("forwards options and ssrOptions to ApexCharts.renderToHTML", async () => {
      const importSpy = spyOn<any>(service, "importSSRModule").and.returnValue(
        Promise.resolve(fakeSSRModule)
      );
      const options = { chart: { type: "line" as const }, series: [{ data: [1, 2, 3] }] };
      const ssrOptions = { width: 500, height: 300 };

      const result = await service.renderToHTML(options, ssrOptions);

      expect(importSpy).toHaveBeenCalledTimes(1);
      expect(mockRenderToHTML).toHaveBeenCalledWith(options, ssrOptions);
      expect(result).toBe("<div>chart-html</div>");
    });

    it("defaults ssrOptions to {} when not provided", async () => {
      spyOn<any>(service, "importSSRModule").and.returnValue(Promise.resolve(fakeSSRModule));
      const options = { chart: { type: "bar" as const }, series: [] };

      await service.renderToHTML(options);

      expect(mockRenderToHTML).toHaveBeenCalledWith(options, {});
    });
  });

  describe("renderToString", () => {
    it("forwards options and ssrOptions to ApexCharts.renderToString", async () => {
      const importSpy = spyOn<any>(service, "importSSRModule").and.returnValue(
        Promise.resolve(fakeSSRModule)
      );
      const options = { chart: { type: "pie" as const }, series: [10, 20, 30] };
      const ssrOptions = { width: 400, height: 200 };

      const result = await service.renderToString(options, ssrOptions);

      expect(importSpy).toHaveBeenCalledTimes(1);
      expect(mockRenderToString).toHaveBeenCalledWith(options, ssrOptions);
      expect(result).toBe("<svg>chart-svg</svg>");
    });

    it("defaults ssrOptions to {} when not provided", async () => {
      spyOn<any>(service, "importSSRModule").and.returnValue(Promise.resolve(fakeSSRModule));
      const options = { chart: { type: "radar" as const }, series: [] };

      await service.renderToString(options);

      expect(mockRenderToString).toHaveBeenCalledWith(options, {});
    });
  });
});
