import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { routes } from './app.routes';
import { MessagesEffects } from './ngrx/effects/messages.effects';
import { messageReducer } from './ngrx/reducer/messages.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(),
    importProvidersFrom(
      StoreModule.forRoot(), 
      StoreModule.forFeature('message', messageReducer), 
      EffectsModule.forRoot([]), 
      EffectsModule.forFeature([MessagesEffects])
    )
  ]
};
