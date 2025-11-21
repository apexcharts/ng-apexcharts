import { bootstrapApplication, BootstrapContext } from "@angular/platform-browser";

import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, appConfig, context);

export default bootstrap;
