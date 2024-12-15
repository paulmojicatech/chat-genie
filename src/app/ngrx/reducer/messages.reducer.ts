import { createReducer, on } from '@ngrx/store';
import { OpenAIHttpPostRequest, OpenAIResponse } from '../../model/message.interface';
import { addMessage, addMessageSuccess, resetMessages } from '../actions/messages.action';
export interface MessageState {
  request: OpenAIHttpPostRequest | undefined;
  messages: (OpenAIResponse & {isProcessing: boolean} )[];
}

export const initialState: MessageState = {
  request: undefined,
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
        model: requestBody.model,
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
        messages: [...state.messages, newMessage],
        request: requestBody
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
  ),
  on(
    resetMessages,
    (state) => {
      return initialState;
    }
  )
);
