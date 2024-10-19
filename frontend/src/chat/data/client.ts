import captureCustomEvents from '@console/utils/captureCustomEvents';

import { globals } from '@/data/globals';
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
  private authToken?: string;
  private projectId?: string;
  private buildId?: string;

  constructor({
    headers,
    baseUrl,
    authToken,
    projectId,
    buildId,
  }: {
    headers?: HeadersInit;
    baseUrl?: string;
    authToken?: string;
    projectId?: string;
    buildId?: string;
  }) {
    this.headers = {
      ...(globals.controlPlanePAT?.trim() &&
        ({ authorization: `pat ${globals.controlPlanePAT}` } as HeadersInit)),
    };
    this.baseUrl = baseUrl ?? '';
    this.projectId = projectId;
    this.buildId = buildId;
    if (authToken) this.authToken = authToken;
  }
  private getUrl(path: string): string {
    return this.baseUrl ? `${this.baseUrl}${path}` : path;
  }

  private getThreadsUrl(thread_id: string): string {
    if (thread_id && thread_id !== '') {
      return this.getUrl(`/threads/${thread_id}/continue`);
    } else {
      return this.getUrl(
        this.projectId && this.buildId
          ? `/threads/start?project_id=${this.projectId}&build_id=${this.buildId}`
          : `/threads/start` // single tenant
      ); // TODO test remove before merge
    }
  }

  createChatStreamReaderV2 = async ({
    threadId,
    message,
    headers,
    onAssistantResponse,
    onThreadIdChange,
    onError,
    onComplete,
  }: {
    threadId: string;
    message: string;
    headers?: Record<string, string>;
    onAssistantResponse: (event: ServerEvent, client: WebSocketClient) => void;
    onThreadIdChange: (newThreadId: string) => void;
    onError: (error: Error) => void;
    onComplete: () => void;
  }): Promise<{
    sendMessage: (message: string) => void;
    disconnect: () => void;
    isConnected: () => Promise<boolean>;
  }> => {
    const isNewMessage = !threadId;
    const threadsUrl = this.getThreadsUrl(threadId);

    const client = new WebSocketClient(threadsUrl);
    await client.connect();

    client.onMessage(message => {
      if (message.type === 'completion') {
        captureCustomEvents('promptql_completion');
        client.disconnect();
        return onComplete();
      }
      if (message.type === 'server_error') {
        captureCustomEvents('promptql_server_error');
        onAssistantResponse(message, client);
        return onError(new Error(message.message));
      }
      if (message.type === 'accept_interaction') {
        captureCustomEvents('promptql_accept_interaction');
        return onThreadIdChange(message.thread_id);
      }

      return onAssistantResponse(message, client);
    });

    client.onClose(() => {
      onComplete();
    });

    client.sendMessage({
      type: 'client_init',
      version: 'v1',
      ...(isNewMessage && { ddn_headers: headers }), // Send ddn_headers only if it's a new message
      ...(globals.controlPlanePAT &&
        globals?.controlPlanePAT !== '' && {
          headers: {
            Authorization: `pat ${globals.controlPlanePAT}`,
          },
        }),
    });

    client.sendMessage({
      type: 'user_message',
      message,
      timestamp: new Date().toISOString(),
    });
    captureCustomEvents('promptql_user_message_new');

    const sendMessage = (newMessage: string) => {
      client.sendMessage({
        type: 'user_message',
        message: newMessage,
        timestamp: new Date().toISOString(),
      });
      captureCustomEvents('promptql_user_message_followup');
    };

    const disconnect = () => {
      client.disconnect();
    };

    return { sendMessage, disconnect, isConnected: client.isConnected };
  };

  async getThreads(projectId?: string): Promise<GetThreadsResponse> {
    let url = this.getUrl('/threads');

    // Add projectId as a URL parameter if it exists (for cloud)
    if (projectId && projectId !== 'local') {
      url += `?project_id=${encodeURIComponent(projectId)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
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
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
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
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
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
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
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
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
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
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
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
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
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
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
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
  async deleteThread({ threadId }: { threadId: string }): Promise<Response> {
    return fetch(this.getUrl(`/threads/${threadId}`), {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        ...(this.headers ?? {}),
        'Content-Type': 'application/json',
        ...(this.authToken && { [AUTH_TOKEN_HEADER_KEY]: this.authToken }),
      },
    });
  }
}
