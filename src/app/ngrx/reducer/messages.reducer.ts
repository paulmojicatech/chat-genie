import { createReducer, on } from '@ngrx/store';
import { OpenAIResponse } from '../../model/message.interface';
import { addMessage, addMessageSuccess } from '../actions/messages.action';
export interface MessageState {
  messages: (OpenAIResponse & {isProcessing: boolean} )[];
}

export const initialState: MessageState = {
  messages: []
};

export const messageReducer = createReducer(
  initialState,
  on(
    addMessage,
    (state, { requestBody }) => {
      const newMessage: OpenAIResponse & {isProcessing: boolean} = {
        ...requestBody,
        id: undefined,
        choices: [
          {
            index: 0,
            message: {
              role: requestBody.messages[1].role,
              content: requestBody.messages[1].content
            }
          }
        ],
        isProcessing: true
      };
      return {
        ...state,
        messages: [...state.messages, newMessage]
      }
    }
  ),
  on(
    addMessageSuccess,
    (state, { response }) => {
      const foundIndex = state.messages.findIndex(message => message.appId === response.appId);
      const updatedMessages = structuredClone(state.messages);
      updatedMessages[foundIndex] = {
        ...updatedMessages[foundIndex],
        isProcessing: false
      };
      updatedMessages.push({...response, isProcessing: false});
      return {
        ...state,
        messages: updatedMessages
      };
    }
  )
);
