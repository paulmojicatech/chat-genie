import { NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { v4 } from 'uuid';
import { OpenAIHttpPostRequest } from './model/message.interface';
import { addMessage } from './ngrx/actions/messages.action';
import { selectMessages } from './ngrx/selector/messages.selector';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgClass],
  template: `
    <section class="full-height">
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
          <button class="primary" (click)="addMessage(messageInput.value)">Send</button>
          <button class="default">Reset</button>
        </div>
      </footer>
    </section>
  `,
  styles: `
  .full-height {
      height: 100vh;
    }


    button {
      padding: .5rem;
      text-align: center;
      margin-left: .5rem;
      border-radius: 8px;
      color: white;
      border: none;
    }

    .messages-container {
      height: calc(100vh - 5rem);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
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

    button.primary {
      background-color: #2563eb;
    }

    button.default {
      background-color: #a8a29e;
      color: #111827;
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
    const messagesToShow = messages.map(message => {
      let role = 'user';
      if (message.choices?.length) {
        role = message.choices[0].message.role === 'user' ? 'user' : 'openAI';
      }
      const content = message.choices?.[0].message.content;
      return { role, content };
    }).flat();
    if (messages.some(message => message.isProcessing)) {
      messagesToShow.push({ role: 'openAI', content: '...' });
    }
    return messagesToShow;
  })

  addMessage(message: string) {

    const requestBody: OpenAIHttpPostRequest = {
      appId: v4(),
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }],
      temperature: 0.7
    };
    this._store.dispatch(addMessage(requestBody));
  }
}
