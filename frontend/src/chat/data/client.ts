import { AUTH_TOKEN_HEADER_KEY } from '../constants';
import {
  AIResponse,
  GetThreadRequest,
  GetThreadsResponse,
  SendMessageRequest,
  StartThreadResponse,
} from './api-types';
import { ServerEvent, ThreadResponse } from './Api-Types-v3';
import { WebSocketClient } from './WebSocketClient';

export class ChatClient {
  private headers: HeadersInit;
  private baseUrl: string;
  private authToken: string;

  constructor({
    headers,
    baseUrl,
    authToken,
  }: {
    headers?: HeadersInit;
    baseUrl?: string;
    authToken: string;
  }) {
    this.headers = headers ?? {};
    this.baseUrl = baseUrl ?? '';
    this.authToken = authToken;
  }
  private getUrl(path: string): string {
    return this.baseUrl ? `${this.baseUrl}${path}` : path;
  }

  private getThreadsUrl(thread_id: string): string {
    if (thread_id && thread_id !== '') {
      return this.getUrl(`/threads/${thread_id}/continue`);
    } else {
      return this.getUrl(`/threads/start`);
    }
  }

  createChatStreamReaderV2 = async ({
    threadId,
    message,
    onAssistantResponse,
    onThreadIdChange,
    onError,
    onComplete,
  }: {
    threadId: string;
    message: string;
    onAssistantResponse: (event: ServerEvent, client: WebSocketClient) => void;
    onThreadIdChange: (newThreadId: string) => void;
    onError: (error: Error) => void;
    onComplete: () => void;
  }): Promise<{
    sendMessage: (message: string) => void;
    disconnect: () => void;
    isConnected: () => Promise<boolean>;
  }> => {
    const threadsUrl = this.getThreadsUrl(threadId);

    const client = new WebSocketClient(threadsUrl);
    await client.connect();

    client.onMessage(message => {
      if (message.type === 'completion') {
        client.disconnect();
        return onComplete();
      }
      if (message.type === 'server_error') {
        onAssistantResponse(message, client);
        return onError(new Error(message.message));
      }
      if (message.type === 'accept_interaction') {
        return onThreadIdChange(message.thread_id);
      }

      return onAssistantResponse(message, client);
    });

    client.onClose(() => {
      onComplete();
    });
    client.sendMessage({ type: 'client_init', version: 'v1' });

    client.sendMessage({
      type: 'user_message',
      message,
      timestamp: new Date().toISOString(),
    });
    const sendMessage = (newMessage: string) => {
      client.sendMessage({
        type: 'user_message',
        message: newMessage,
        timestamp: new Date().toISOString(),
      });
    };

    const disconnect = () => {
      client.disconnect();
    };

    return { sendMessage, disconnect, isConnected: client.isConnected };
  };

  async getThreads(): Promise<GetThreadsResponse> {
    const response = await fetch(this.getUrl('/threads'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  }
  async getPachaConnectionConfigCheck(): Promise<string> {
    const response = await fetch(this.getUrl('/config-check'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.text();
  }

  async getThread({ threadId }: GetThreadRequest): Promise<ThreadResponse> {
    const response = await fetch(this.getUrl(`/threads/${threadId}`), {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  }

  async startThread(): Promise<StartThreadResponse> {
    const response = await fetch(this.getUrl(`/threads`), {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        'Content-Type': 'application/json',
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async sendMessage({
    threadId,
    message,
  }: SendMessageRequest): Promise<AIResponse> {
    const threadsUrl = this.getUrl(`/threads${threadId ? `/${threadId}` : ''}`);
    const response = await fetch(threadsUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        'Content-Type': 'application/json',
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async sendMessageStream({
    threadId,
    message,
  }: SendMessageRequest): Promise<Response> {
    const threadsUrl = this.getUrl(`/threads${threadId ? `/${threadId}` : ''}`);
    const controller = new AbortController();
    const signal = controller.signal;
    return fetch(threadsUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        'Content-Type': 'application/json',
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
      body: JSON.stringify({ message }),
      signal,
    });
  }

  async sendUserConfirmation({
    threadId,
    confirmationId,
    confirm,
  }: {
    threadId: string;
    confirmationId: string;
    confirm: boolean;
  }): Promise<Response> {
    return fetch(this.getUrl(`/threads/${threadId}/user_confirmation`), {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        'Content-Type': 'application/json',
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
      body: JSON.stringify({
        confirmation_id: confirmationId,
        confirm,
      }),
    });
  }
  async submitFeedback({
    threadId,
    mode,
    feedbackEnum,
    message,
    feedbackText,
  }: {
    threadId: string;
    mode: string;
    feedbackEnum: number;
    message?: string;
    feedbackText?: string;
  }): Promise<Response> {
    return fetch(this.getUrl(`/threads/${threadId}/submit-feedback`), {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        'Content-Type': 'application/json',
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
      body: JSON.stringify({
        thread_id: threadId,
        mode,
        feedback_enum: feedbackEnum,
        message,
        feedback_text: feedbackText ?? '',
      }),
    });
  }
}
