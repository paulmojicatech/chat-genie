import { createAction, props } from '@ngrx/store';
import { Message } from '../../model/message.interface';

export const addMessage = createAction(
  '[Messages] Add Message',
  (message: string) => ({ message })
);

export const addMessageSuccess = createAction(
  '[Messages] Add Message Success',
  props<{ response: Message }>()
);
