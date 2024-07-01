import { enableProdMode } from "@angular/core";

import { environment } from "./environments/environment";
import { bootstrapApplication } from "@angular/platform-browser";

import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

if (environment.production) {
  enableProdMode();
}

document.addEventListener("DOMContentLoaded", () =>
  bootstrapApplication(AppComponent, appConfig)
);
