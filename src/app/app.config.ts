import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { StoreModule, provideStore } from '@ngrx/store';
import { messageReducer } from './ngrx/reducer/messages.reducer';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(StoreModule.forRoot(), StoreModule.forFeature('message', messageReducer))]
};
