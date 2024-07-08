import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { OpenAIHttpPostRequest, OpenAIResponse } from '../model/message.interface';
import { Observable, catchError, throwError } from 'rxjs';
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

    return this._httpClient.post<OpenAIResponse>(this._OPEN_AI_API_URL, reqBody, {headers}).pipe(
      catchError((error: any) => {
        console.error('Error in OpenAiHttpService:', error);
        return throwError(() => error);
      })
    )
  }


}
