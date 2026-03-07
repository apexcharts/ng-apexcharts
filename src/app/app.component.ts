import { Component, signal } from "@angular/core";
import { FullDemoComponent } from "./demos/full/full-demo.component";
import { TreeShakingDemoComponent } from "./demos/tree-shaking/tree-shaking-demo.component";
import { SsrDemoComponent } from "./demos/ssr/ssr-demo.component";

type Tab = "full" | "tree-shaking" | "ssr";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [FullDemoComponent, TreeShakingDemoComponent, SsrDemoComponent],
  template: `
    <header class="container">
      <hgroup>
        <h1>ng-apexcharts</h1>
        <p>Angular wrapper for <a href="https://apexcharts.com" target="_blank">ApexCharts</a> — interactive demos</p>
      </hgroup>
    </header>

    <main class="container">
      <nav>
        <ul>
          <li>
            <button
              [class.outline]="activeTab() !== 'full'"
              (click)="activeTab.set('full')"
            >Full bundle</button>
          </li>
          <li>
            <button
              [class.outline]="activeTab() !== 'tree-shaking'"
              (click)="activeTab.set('tree-shaking')"
            >Tree-shaking</button>
          </li>
          <li>
            <button
              [class.outline]="activeTab() !== 'ssr'"
              (click)="activeTab.set('ssr')"
            >SSR + Hydration</button>
          </li>
        </ul>
      </nav>

      <hr />

      @switch (activeTab()) {
        @case ('full') { <app-full-demo /> }
        @case ('tree-shaking') { <app-tree-shaking-demo /> }
        @case ('ssr') { <app-ssr-demo /> }
      }
    </main>
  `,
})
export class AppComponent {
  readonly activeTab = signal<Tab>("ssr");
}
