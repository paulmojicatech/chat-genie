import { createAction, props } from '@ngrx/store';
import { OpenAIResponse, OpenAIHttpPostRequest } from '../../model/message.interface';

export const addMessage = createAction(
  '[Messages] Add Message',
  (requestBody: OpenAIHttpPostRequest) => ({ requestBody })
);

export const addMessageSuccess = createAction(
  '[Messages] Add Message Success',
  props<{ response: OpenAIResponse }>()
);

export const openAIError = createAction(
  '[Messages] OpenAI Error',
  props<{ error: any }>()
);
