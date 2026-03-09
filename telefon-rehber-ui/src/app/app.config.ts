import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  TranslateModule,
  provideTranslateLoader,
  provideTranslateService
} from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    provideTranslateService({
      defaultLanguage: 'tr',
      loader: provideTranslateLoader(TranslateHttpLoader)
    }),
    importProvidersFrom(TranslateModule)
  ]
};
