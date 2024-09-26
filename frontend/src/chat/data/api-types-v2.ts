// /thread/<id> API V2 response types
export interface Thread {
  thread_id: string;
  history: HistoryItem[];
  artifacts: Artifact[];
  user_confirmations: UserConfirmation[];
}

export interface UserConfirmation {
  confirmation_id: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'TIMED_OUT' | 'CANCELED';
}

// Types for history items
export type HistoryItem =
  | UserMessage
  | AssistantMessage
  | ToolResponse
  | UserConfirmationRequest;

export interface UserMessage {
  text: string;
  type: 'user';
}

export interface AssistantMessage {
  text: string;
  tool_calls: ToolCall[];
  type: 'assistant';
}

export interface ToolResponse {
  tool_responses: ToolResponseItem[];
  type: 'tool_response';
}

// Types for tool calls and responses
export interface ToolCall {
  name: string;
  call_id: string;
  input: {
    python_code: string;
  };
}

export interface ToolResponseItem {
  call_id: string;
  output: ToolResponseOutput;
}

export interface ToolResponseOutput {
  output: string;
  error: string | null;
  sql_statements: Array<{ sql: string; result: unknown }>;
  modified_artifacts: Artifact[];
}

// Types for artifacts
export interface Artifact {
  identifier: string;
  title: string;
  artifact_type: string;
  data: ArtifactData[];
}

export interface ArtifactData {
  Fruit: string;
  Color: string;
}

export interface UserConfirmationRequest {
  type: 'user_confirmation_request';
  message: string;
  confirmation_id: string;
}
