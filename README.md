# Integreate OpenAI Inside of Angular App

## Overview
Generative AI is all the rage today.  It seems we can't go a day without hearing about AI, especially in the tech industry.  OpenAI is a big reason why.  OpenAI provides an API to leverage their trained models.  One of the most popular access they provide is access to their LLMs (large language models).

## What are we doing?
In this article, we will show how we can utilize OpenAI to create a chat bot that you can ask up to 3 questions and it will generate an answer for each question.  We call the application <i>Chat Genie</i>.

The code for this is located on [Github](https://github.com/paulmojicatech/chat-genie).

## What are we NOT doing?
This app will use Angular and NgRx.  We will show and explain the code, but we will not go deep into explaining NgRx.

## OpenAI Mechanics
OpenAI allows you to call an API for their text generation service.  The documentation is located [here](https://platform.openai.com/docs/guides/text-generation).  With this API, you can string together questions to continue to build context.  In our application, we allow up to 3 questions to be strung together.

<b>Please note: OpenAI bills based on tokens.  Tokens are the words and / or phrases that are part of the request.</b>

## Let's Get To It
- src/app/app.component.ts
``` js
import { NgClass } from '@angular/common';
import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { v4 } from 'uuid';
import { OpenAIHttpPostRequest } from './model/message.interface';
import { addMessage, resetMessages } from './ngrx/actions/messages.action';
import { selectMessages, selectRequest } from './ngrx/selector/messages.selector';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgClass],
  template: `
    <section class="full-height">
      <header>
        <span>Chat Genie</span>
      </header>
      <div class="messages-container">
        @for (message of messagesS(); track $index) {
          <div class="messages" [ngClass]="{'user': message.role === 'user', 'openAI': message.role === 'openAI'}">
            {{message.content}}
          </div>
        }
      </div>
      <footer>
        <div class="action-container">
          <input #messageInput type="text" placeholder="Enter your message"/>
          <button [disabled]="isSendDisabled()" class="primary" (click)="addMessage(messageInput.value)">Send</button>
          <button class="default" (click)="resetQuestions()">Reset</button>
        </div>
      </footer>
    </section>
  `,
  styles: `
  .full-height {
      height: 100vh;
    }

    header {
      height: 3rem;
      background-color: #2563eb;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 2rem;
    }

    button {
      padding: .5rem;
      text-align: center;
      margin-left: .5rem;
      border-radius: 8px;
      color: white;
      border: none;

      &:disabled {
        opacity: 0.5;
      }
      &.primary {
        background-color: #2563eb;
      }
      &.default {
        background-color: #a8a29e;
        color: #111827;
      }
    }

    .messages-container {
      height: calc(100vh - 9rem); // header + footer + margin-top
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      margin: 1rem 1rem 0 1rem;
      .messages {
        border-radius: 8px;
        padding: 1.5rem;
        width: 20rem;
        margin-bottom: 1rem;
        text-align: center;

        &.user {
          align-self: flex-start;
          background-color: #fcd34d;
        }
        &.openAI {
          align-self: flex-end;
          background-color: #bbf7d0;
        }
      }
    }

    footer {
      position: sticky;
      bottom: 0;
      height: 5rem;
      justify-self: center;
      .action-container {
        display: inline-flex;
        height: 50%;
        justify-content: center;
        input {
          width: 50vw;
          border-radius: 8px;
        }
      }
    }
  `
})
export class AppComponent {

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;

  private _store = inject(Store);

  messagesS = this._store.selectSignal(selectMessages);

  isSendDisabled = computed(() => {
    const messages = this._store.selectSignal(selectMessages)();
    return messages.some(message => message.isProcessing) || messages.length > 6;
  });

  addMessage(message: string) {
    const storeRequest = this._store.selectSignal(selectRequest)();
    let messages: {
      role: string;
      content: string;
    }[] = [];
    if (!storeRequest) {
      messages = [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }]
    } else {
      messages = [...storeRequest.messages, { role: 'user', content: message }];

    }
    const requestBody: OpenAIHttpPostRequest = {
      appId: v4(),
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7
    };
    this._store.dispatch(addMessage(requestBody));
    this.messageInput.nativeElement.value = '';
  }

  resetQuestions(): void {
    this._store.dispatch(resetMessages());
  }
}

```
This is the component the shows messages.  When a user hits the Send button, an action is dispatched that will kick off the request.

- src/app/ngrx/messages.effects.ts
``` js
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { OpenAiHttpService } from '../../services/open-ai-http.service';
import { addMessage, addMessageSuccess, openAIError } from '../actions/messages.action';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectMessages } from '../selector/messages.selector';
import { OpenAIResponse } from '../../model/message.interface';

@Injectable()
export class MessagesEffects {
  private _actions$ = inject(Actions);
  private _openAiHttpService = inject(OpenAiHttpService);
  private _store = inject(Store);

  addMessage$ = createEffect(
    () => this._actions$.pipe(
      ofType(addMessage),
      withLatestFrom(this._store.select(selectMessages)),
      filter(([action, messages]) => {
        return messages.length <= 6;
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
```
This file shows 2 effects.  One is to call the service that makes the HTTP request to OpenAI.  This effect is called only when the number of messages in the store is 6 or less.  The reason for 6 is because we allow 3 questions and each question is comprised of 2 messages, one is the user question and the second is the response from OpenAI.  The second effect adds a new message that lets the user know that the limit has been hit instead of making this HTTP call to OpenAI.

- src/app/services/open-ai-http.service.ts
``` js
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { OpenAIHttpPostRequest, OpenAIResponse } from '../model/message.interface';
import { Observable, catchError, map, throwError } from 'rxjs';
import { OPEN_AI_API_KEY } from '../secrets';

@Injectable({
  providedIn: 'root'
})
export class OpenAiHttpService {

  private _httpClient = inject(HttpClient);


  private readonly _OPEN_AI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly _OPEN_AI_API_KEY = OPEN_AI_API_KEY;

  getOpenAiResponse(reqBody: OpenAIHttpPostRequest): Observable<OpenAIResponse> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${this._OPEN_AI_API_KEY}`);
    headers = headers.append('Content-Type', 'application/json');
    const clonedBody = {...reqBody};
    delete clonedBody.appId;

    return this._httpClient.post<OpenAIResponse>(this._OPEN_AI_API_URL, clonedBody, {headers}).pipe(
      map(response => ({...response, appId: reqBody.appId!})),
      catchError((error: any) => {
        console.error('Error in OpenAiHttpService:', error);
        return throwError(() => error);
      })
    )
  }
}
```
The one thing to notice here is that we delete the property `appId` from the request body.  This property is used in the reducer to map the pending request in the store to the response after the API request is successful.

- src/app/model/message.interface.ts
``` js
export interface OpenAIHttpPostRequest {
  appId?: string;
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  temperature: number;
}

export interface OpenAIResponse {
 appId?: string;
 id?: string;
 object?: string;
 created?: Date;
 model: string;
 messages?: {role: string; content: string}[];
 choices: {
  index: number;
  message: {
    content: string;
    role: string;
  },
  logprobs?: string;
 }[];
 usage?: OpenAIUsage;
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
```
This is the interface for the request and response from the OpenAI contract.

- src/app/ngrx/reducer.messages.reducer.ts
``` js
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
```
This is what updates the store that the `app.component.ts` listens to.  When the `addMessage` action is dispatched, we update the messages value to append the new request with the 'user' role item and set the temporary 'openAI' role with a `...` value.  After the success message, we switch the `...` value to the response from OpenAI.

## That's All Folks
I hope this article was helpful.  All the code is posted on my [Github](https://github.com/paulmojicatech/chat-genie). The only thing needed is to create `src/app/secrets.ts` to include your own `OPEN_AI_API_KEY`.