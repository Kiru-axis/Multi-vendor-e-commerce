import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
  ApplicationConfig,
  enableProdMode,
  importProvidersFrom,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withHashLocation } from '@angular/router';
import { withInterceptors, provideHttpClient } from '@angular/common/http';

// third party
import { ToastrModule } from 'ngx-toastr';

// user defined
import { routes } from './app.routes';
import { environment } from '@environments/environment.development';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { jwtInterceptor } from '@core/interceptors/jwt.interceptor';

if (environment.production) {
  enableProdMode();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),

    //
    importProvidersFrom([
      ToastrModule.forRoot({
        preventDuplicates: true,
        timeOut: 10000,
        positionClass: 'toast-bottom-right',
      }),
    ]),
  ],
};
