import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { OpenAIHttpPostRequest } from './model/message.interface';
import { addMessage } from './ngrx/actions/messages.action';
import { selectMessages } from './ngrx/selector/messages.selector';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private _store = inject(Store);

  messagesS = computed(() => {
    const messages = this._store.selectSignal(selectMessages)();
    console.log(messages); 
    return messages.map(message => {
      return message.choices.map(choice => {
        return choice.message.content;
      })
    }).flat();
  })

  addMessage(message: string) {

    const requestBody: OpenAIHttpPostRequest = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }],
      temperature: 0.7
    };
    this._store.dispatch(addMessage(requestBody));
  }
}
