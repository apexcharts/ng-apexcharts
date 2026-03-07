import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Inject,
  input,
  makeStateKey,
  OnInit,
  PLATFORM_ID,
  PendingTasks,
  TransferState,
} from "@angular/core";
import { isPlatformServer } from "@angular/common";
import { ApexOptions } from "../model/apex-types";
import { ChartSSRService } from "../services/chart-ssr.service";

/**
 * Server-side rendering component for ApexCharts.
 *
 * On the server: renders SVG imperatively into the host element, stores HTML in TransferState.
 * On the client: ngSkipHydration tells Angular to leave the host DOM alone.
 * afterNextRender then injects the HTML from TransferState into the host imperatively
 * (as a fallback if ngSkipHydration stripped the content, which it does with empty templates).
 * ChartHydrateComponent also uses afterNextRender so it runs after this, guaranteeing
 * [data-apexcharts-hydrate] is present when Pattern B calls hydrate().
 *
 * @example
 * <apx-chart-ssr [options]="chartOptions" [width]="500" [height]="300" />
 */
@Component({
  selector: "apx-chart-ssr",
  template: ``,
  standalone: true,
  host: { ngSkipHydration: "true" },
})
export class ChartSSRComponent implements OnInit {
  readonly options = input.required<ApexOptions>();
  readonly width = input<number>(400);
  readonly height = input<number>(300);

  private readonly chartSSRService = inject(ChartSSRService);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly transferState = inject(TransferState);
  private readonly stateKey = makeStateKey<string>(`apx-chart-ssr-${this.chartSSRService.nextInstanceId()}`);
  private readonly isServer: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isServer = isPlatformServer(platformId);

    if (!this.isServer) {
      afterNextRender(() => {
        const host = this.el.nativeElement;
        const html = this.transferState.get(this.stateKey, "");
        this.transferState.remove(this.stateKey);

        if (html) {
          // html is a JSON string: { svgOuter: "<svg ...>...</svg>", config: "base64..." }
          const { svgOuter, config } = JSON.parse(html) as { svgOuter: string; config: string };

          // Parse SVG via XML parser to correctly handle self-closing tags and namespaces.
          // Using innerHTML on an HTML element would corrupt the SVG tree (HTML parser mode).
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgOuter, 'image/svg+xml');
          const svgEl = document.importNode(svgDoc.documentElement, true);

          // Create wrapper div with attributes needed by ApexCharts.hydrate()
          const wrapper = document.createElement('div');
          wrapper.className = 'apexcharts-ssr-wrapper';
          wrapper.setAttribute('data-apexcharts-hydrate', '');
          if (config) wrapper.setAttribute('data-apexcharts-config', config);

          wrapper.appendChild(svgEl);
          host.innerHTML = '';
          host.appendChild(wrapper);
        }
      });
    }
  }

  async ngOnInit(): Promise<void> {
    if (!this.isServer) return;

    const done = this.pendingTasks.add();
    const ssrOptions = { width: this.width(), height: this.height() };
    try {
      const [html, svgOuter] = await Promise.all([
        this.chartSSRService.renderToHTML(this.options(), ssrOptions),
        this.chartSSRService.renderToString(this.options(), ssrOptions),
      ]);
      const configMatch = html.match(/data-apexcharts-config="([^"]*)"/);
      const config = configMatch?.[1] ?? '';
      this.transferState.set(this.stateKey, JSON.stringify({ svgOuter, config }));
      this.el.nativeElement.innerHTML = html;
    } finally {
      done();
    }
  }
}
