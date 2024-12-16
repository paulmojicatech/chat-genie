import { createReducer, on } from '@ngrx/store';
import { OpenAIHttpPostRequest, OpenAIResponse } from '../../model/message.interface';
import { addMessage, addMessageSuccess, resetMessages } from '../actions/messages.action';
export interface MessageState {
  request: OpenAIHttpPostRequest | undefined;
  messages: {appId?: string, role: string, content: string, isProcessing: boolean}[];
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
      const lastQuestionIndex = requestBody.messages.length - 1;
      const newMessage: {role: string, content: string, isProcessing: boolean} = {
        role: requestBody.messages[lastQuestionIndex].role,
        content: requestBody.messages[lastQuestionIndex].content,
        isProcessing: false
      };
      return {
        ...state,
        messages: [...state.messages, newMessage, {appId: requestBody.appId!, role: 'openAI', content: '...', isProcessing: true}],
        request: requestBody
      }
    }
  ),
  on(
    addMessageSuccess,
    (state, { response }) => {
      const foundQuestionIndex = state.messages.findIndex((message) => message.appId === response.appId);
      const newMessage: {appId: string, role: string, content: string, isProcessing: boolean} = {
        appId: response.appId!,
        role: 'openAI',
        content: response.choices[0].message.content,
        isProcessing: false
      };
      const updatedMessages = structuredClone(state.messages);
      updatedMessages[foundQuestionIndex] = newMessage;
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
