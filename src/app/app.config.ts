import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

// No router or HTTP: the whole app is one board, and data lives in the browser (localStorage).
// BoardStore and the CDK Dialog service are providedIn: 'root', so nothing else needs registering.
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true })],
};
