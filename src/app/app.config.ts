import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideClientHydration } from "@angular/platform-browser";

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZonelessChangeDetection(),
  ],
};
