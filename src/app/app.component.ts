import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectMessages } from './ngrx/selector/messages.selector';
import { addMessage } from './ngrx/actions/messages.action';

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
    this._store.dispatch(addMessage(message));
  }
}
