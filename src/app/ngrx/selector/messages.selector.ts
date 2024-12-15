import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageState } from '../reducer/messages.reducer';

export const selectMessageState = createFeatureSelector<MessageState>('message');

export const selectMessages = createSelector(
  selectMessageState,
  (state: MessageState) => state.messages
);
