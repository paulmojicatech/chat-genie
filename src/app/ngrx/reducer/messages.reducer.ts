import { createReducer, on } from '@ngrx/store';
import {addMessage} from '../actions/messages.action';
export interface MessageState {
  messages: string[];
}

export const initialState: MessageState = {
  messages: []
};

export const messageReducer = createReducer(
  initialState,
  on(addMessage, (state, { message }) => {
    return {
      messages: [...state.messages, message]
    };
  })
);