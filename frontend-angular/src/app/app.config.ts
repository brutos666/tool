import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorInterceptor } from './errors/error-interceptor.js';
import { FILE_SERVICE } from './services/file-service.js';
import { DesktopFileService } from './services/desktop-file-service.js';
import { BrowserFileService } from './services/browser-file-service.js';
import { environment } from './config/environment.js';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    {
      provide: FILE_SERVICE,
      useFactory: () => (environment.desktop ? new DesktopFileService() : new BrowserFileService()),
    },

    provideHttpClient(withInterceptors([ErrorInterceptor.notify])),
  ],
};
