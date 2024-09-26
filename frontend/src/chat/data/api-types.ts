type Primitive = string | number | boolean | null;

type JsonObject = {
  [key: string]: JsonValue | undefined;
};

interface JsonArray extends Array<JsonValue> {}

type JsonValue = Primitive | JsonObject | JsonArray;

export type Json = JsonValue;

export type AIResponse = {
  response: string;
  query_plan_python?: string;
  query_plan_output?: string;
  data_fetches?: {
    sql: string;
    response: Json;
  }[];
};

export type AIInteraction = {
  /**
   * The prompt message
   */
  message: string;
  /**
   * The response from the AI
   */
  response?: AIResponse;
  loading?: boolean;
  error?: string;
  shouldStream?: boolean;
  pendingId?: string;
};

export type Thread = { thread_id: string; title: string };

export type ThreadHistory = Thread & {
  history: AIInteraction[];
};

// request/response types
export type ErrorResponse = {
  error: string;
};

export type StartThreadResponse = {
  thread_id: string;
};

// send message
export type SendMessageRequest = {
  message: string;
  threadId?: string;
};

export type SendMessageResponse = AIInteraction;

// get thread
export type GetThreadRequest = {
  threadId: string;
};
export type GetThreadResponse = ThreadHistory;

// get threads
export type GetThreadsResponse = Thread[];
