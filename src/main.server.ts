import { bootstrapApplication, BootstrapContext } from "@angular/platform-browser";
import { mergeApplicationConfig } from "@angular/core";
import { provideServerRendering } from "@angular/ssr";

import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

const serverConfig = mergeApplicationConfig(appConfig, {
  providers: [provideServerRendering()],
});

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, serverConfig, context);

export default bootstrap;
