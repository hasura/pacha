import { AUTH_TOKEN_HEADER_KEY } from "../constants";
import {
  AIResponse,
  GetThreadRequest,
  GetThreadsResponse,
  SendMessageRequest,
  StartThreadResponse,
} from "./api-types";
import { Thread } from "./api-types-v2";

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
    this.baseUrl = baseUrl ?? "";
    this.authToken = authToken;
  }
  private getUrl(path: string): string {
    return this.baseUrl ? `${this.baseUrl}${path}` : path;
  }

  createChatStreamReader = ({
    threadId,
    message,
    onData,
    onThreadIdChange,
    onError,
    onComplete,
  }: {
    threadId: string;
    message: string;
    onData: (eventName: string, dataLine: string) => void;
    onThreadIdChange: (newThreadId: string) => void;
    onError: (error: Error) => void;
    onComplete: () => void;
  }) => {
    const reader = this.sendMessageStream({ threadId, message }).then(
      (response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.body!.getReader();
      }
    );

    const decoder = new TextDecoder();

    // Buffering logic to handle scenarios where a chunk contains multiple events and partial events.
    let buffer = "";
    const processBuffer = () => {
      // separates the buffer into potential events.
      const events = buffer.split("\n\n");

      // takes all but the last element, ensuring we only process complete events.
      const completeEvents = events.slice(0, -1);

      //keeps the last (potentially partial) event in the buffer for the next processing cycle.
      buffer = events[events.length - 1];

      completeEvents.forEach((event) => {
        // as per the spec, each event should have two lines
        const [eventLine, dataLine] = event.split("\n");
        if (eventLine && dataLine) {
          const eventName = eventLine.replace("event: ", "");
          const eventData = dataLine.replace("data: ", "");

          if (eventName === "start") {
            const newThreadId = JSON.parse(eventData).thread_id;
            onThreadIdChange(newThreadId);
          } else {
            onData(eventName, eventData);
          }
        }
      });
    };
    const read = (
      reader: ReadableStreamDefaultReader<Uint8Array>
    ): Promise<void> => {
      return reader.read().then(({ done, value }) => {
        if (done) {
          processBuffer(); // Process any remaining data in the buffer
          onComplete();
          return;
        }
        const chunkRaw = decoder.decode(value, { stream: true });
        buffer += chunkRaw;
        processBuffer();
        return read(reader);
      });
    };

    reader.then(read).catch(onError);
  };

  async getThreads(): Promise<GetThreadsResponse> {
    const response = await fetch(this.getUrl("/threads"), {
      method: "GET",
      credentials: "include",
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
    const response = await fetch(this.getUrl("/config-check"), {
      method: "GET",
      credentials: "include",
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

  async getThread({ threadId }: GetThreadRequest): Promise<Thread> {
    const response = await fetch(this.getUrl(`/threads/${threadId}`), {
      method: "GET",
      credentials: "include",
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
      method: "POST",
      credentials: "include",
      headers: {
        ...(this.headers ?? {}),
        "Content-Type": "application/json",
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
    const threadsUrl = this.getUrl(`/threads${threadId ? `/${threadId}` : ""}`);
    const response = await fetch(threadsUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(this.headers ?? {}),
        "Content-Type": "application/json",
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
    const threadsUrl = this.getUrl(`/threads${threadId ? `/${threadId}` : ""}`);
    const controller = new AbortController();
    const signal = controller.signal;
    return fetch(threadsUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(this.headers ?? {}),
        "Content-Type": "application/json",
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
      method: "POST",
      credentials: "include",
      headers: {
        ...(this.headers ?? {}),
        "Content-Type": "application/json",
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
      method: "POST",
      credentials: "include",
      headers: {
        ...(this.headers ?? {}),
        "Content-Type": "application/json",
        [AUTH_TOKEN_HEADER_KEY]: this.authToken,
      },
      body: JSON.stringify({
        thread_id: threadId,
        mode,
        feedback_enum: feedbackEnum,
        message,
        feedback_text: feedbackText ?? "",
      }),
    });
  }
}
