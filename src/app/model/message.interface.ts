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
 choices?: {
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
