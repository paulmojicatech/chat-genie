import { createReducer, on } from '@ngrx/store';
import { OpenAIResponse } from '../../model/message.interface';
import { addMessageSuccess } from '../actions/messages.action';
export interface MessageState {
  messages: OpenAIResponse[];
}

export const initialState: MessageState = {
  messages: []
};

export const messageReducer = createReducer(
  initialState,
  on(
    addMessageSuccess,
    (state, { response }) => ({
      ...state,
      messages: [...state.messages, response]
    })
  )
);
