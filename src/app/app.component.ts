import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectMessages } from './ngrx/selector/messages.selector';
import { addMessage } from './ngrx/actions/messages.action';
import { OpenAIHttpPostRequest } from './model/message.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private _store = inject(Store);

  messagesS = this._store.selectSignal(selectMessages);

  addMessage(message: string) {

    const requestBody: OpenAIHttpPostRequest = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }],
      temperature: 0.7
    };
    this._store.dispatch(addMessage(requestBody));
  }
}
