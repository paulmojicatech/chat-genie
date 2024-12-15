import { NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { v4 } from 'uuid';
import { OpenAIHttpPostRequest } from './model/message.interface';
import { addMessage } from './ngrx/actions/messages.action';
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
          <button class="default">Reset</button>
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
  private _store = inject(Store);

  messagesS = computed(() => {
    const messages = this._store.selectSignal(selectMessages)();
    let userIndex = 0;
    const messagesToShow = messages.map((message) => {
      let role = 'user';
      if (message.choices?.length) {
        role = message.choices[0].message.role === 'user' ? 'user' : 'openAI';
      }
      const foundUserIndex = message.messages?.findIndex((message, mIndex) => message.role === 'user' && mIndex > userIndex) ?? 0;
      const content = role === 'openAI' ? message.choices?.[0].message.content : message.messages?.[foundUserIndex].content;
      if (role === 'user') {
        userIndex++;
      }
      return { role, content };
    }).flat();
    if (messages.some(message => message.isProcessing)) {
      messagesToShow.push({ role: 'openAI', content: '...' });
    }
    return messagesToShow;
  });

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
  }
}
