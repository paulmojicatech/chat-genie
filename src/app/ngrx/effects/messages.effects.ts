import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { OpenAiHttpService } from '../../services/open-ai-http.service';
import { addMessage, addMessageSuccess, openAIError } from '../actions/messages.action';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectMessages, selectMessageState } from '../selector/messages.selector';
import { OpenAIResponse } from '../../model/message.interface';

@Injectable()
export class MessagesEffects {
  private _actions$ = inject(Actions);
  private _openAiHttpService = inject(OpenAiHttpService);
  private _store = inject(Store);

  addMessage$ = createEffect(
    () => this._actions$.pipe(
      ofType(addMessage),
      withLatestFrom(this._store.select(selectMessageState)),
      filter(([action, state]) => {
        if (!state.request) {
          return true;
        } else {
          return !!state.request.messages ? state.request.messages?.length <= 6 : true;
        }
      }),
      switchMap(([action]) => this._openAiHttpService.getOpenAiResponse(action.requestBody).pipe(
        map(response => addMessageSuccess({ response })),
        catchError(error => ([openAIError({ error })]))
      ))
    )
  );

  addMessagesLimit$ = createEffect(
    () => this._actions$.pipe(
      ofType(addMessage),
      withLatestFrom(this._store.select(selectMessages)),
      filter(([action, messages]) => messages.length > 6),
      map(([action]) => {
        const updatedMessage: OpenAIResponse = {
          model: action.requestBody.model,
          appId: action.requestBody.appId,
          choices: [
            {
              index: 0,
              message: {
                content: 'The Great Chat Genien only answers 3 questions!',
                role: 'openAI'
              }
            }
          ]
        };
        return addMessageSuccess({ response: updatedMessage });
      })
    )
  );
}
