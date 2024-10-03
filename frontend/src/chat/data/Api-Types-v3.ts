// ISO 8601
type Timestamp = string;

type UserConfirmationResponseStatus = 'timeout' | 'approve' | 'deny';

interface UserConfirmationResponse {
  timestamp: Timestamp;
  status: UserConfirmationResponseStatus;
}

interface UserConfirmation {
  request_timestamp: Timestamp;
  message: string;
  response: UserConfirmationResponse | null;
}

interface Code {
  code_block_id: string;
  code: string;
  execution_start_timestamp: string | null;
  execution_end_timestamp: string | null;
  output: string | null;
  error: string | null;
  user_confirmations: UserConfirmation[];
  sql_statements: Array<{ sql: string; result: unknown }>;
  internal_tool_call?: {
    name: string;
    call_id: string;
    input: Record<string, string>;
  };
}

interface AssistantAction {
  action_id: string;
  message?: string;
  code?: Code;
  error?: string;
  action_end_timestamp: string;
  response_start_timestamp: string;
  tokens_used: number;
}

export interface UserMessage {
  type: 'user_message';
  timestamp: Timestamp;
  message: string;
}

export interface ThreadInteraction {
  user_message: UserMessage;
  assistant_actions: AssistantAction[];
  complete: boolean; // If this is False, it means UX should render something like "Assistant interrupted"
  error?: string;
}

interface Artifact {
  artifact_type: string;
  data: Record<string, unknown>[];
  identifier: string;
  title: string;
}

export interface ThreadState {
  artifacts: Artifact[];
  interactions: ThreadInteraction[];
  version: 'v1';
}

export interface ThreadResponse {
  state: ThreadState;
  thread_id: string;
  title: string;
}

// Client sent events
interface ClientInit {
  type: 'client_init';
  version: 'v1';
}

export interface UserConfirmationResponseEvent {
  type: 'user_confirmation_response';
  response: 'approve' | 'deny';
  confirmation_request_id: string;
}

export type ClientEvent =
  | ClientInit
  | UserMessage
  | UserConfirmationResponseEvent;

// Server events
interface CallingLlmEvent {
  type: 'llm_call';
}

interface AcceptInteraction {
  type: 'accept_interaction';
  interaction_id: string;
  thread_id: string;
}

export interface AssistantMessageResponse {
  type: 'assistant_message_response';
  assistant_action_id: string;
  message_chunk?: string;
}
export interface AssistantCodeResponse {
  type: 'assistant_code_response';
  assistant_action_id: string;
  code_block_id: string;
  code_chunk?: string;
}

interface ExecutingCode {
  type: 'executing_code';
}

export interface CodeOutput {
  type: 'code_output';
  output_chunk: string;
  code_block_id: string;
}

interface ArtifactUpdate {
  type: 'artifact_update';
  artifact: Artifact;
}

interface CodeError {
  type: 'code_error';
  code_block_id: string;
  error: string;
}

export interface UserConfirmationRequest {
  type: 'user_confirmation_request';
  confirmation_request_id: string;
  message: string;
}

interface UserConfirmationTimeout {
  type: 'user_confirmation_timeout';
}

interface ServerError {
  type: 'server_error';
  message: string;
}

interface Completion {
  type: 'completion';
}

export type ServerEvent =
  | CallingLlmEvent
  | AcceptInteraction
  | AssistantMessageResponse
  | AssistantCodeResponse
  | ExecutingCode
  | CodeOutput
  | ArtifactUpdate
  | CodeError
  | UserConfirmationRequest
  | UserConfirmationTimeout
  | ServerError
  | Completion;

// Combined type for all possible events
export type WebSocketEvent = ClientInit | ClientEvent | ServerEvent;
