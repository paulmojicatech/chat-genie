import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { OpenAiHttpService } from '../../services/open-ai-http.service';
import { addMessage, addMessageSuccess, openAIError } from '../actions/messages.action';
import { catchError, map, switchMap } from 'rxjs';

@Injectable()
export class MessagesEffects {
  private _actions$ = inject(Actions);
  private _openAiHttpService = inject(OpenAiHttpService);

  addMessage$ = createEffect(
    () => this._actions$.pipe(
      ofType(addMessage),
      switchMap(action => this._openAiHttpService.getOpenAiResponse(action.requestBody).pipe(
        map(response => addMessageSuccess({ response })),
        catchError(error => ([openAIError({ error })]))
      ))
    )
  );
}
