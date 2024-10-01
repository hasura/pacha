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
  code: string;
  output?: string;
  error?: string;
  user_confirmations: UserConfirmation[];
}

interface AssistantAction {
  message?: string;
  code?: Code;
  error?: string; // Eg: If the assistant tried to request code execution incorrectly
}

interface UserMessage {
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
  // Define the structure of Artifact here
  // For example:
  type: string;
  data: unknown;
}

export interface ThreadState {
  artifacts: Artifact[];
  interactions: ThreadInteraction[];
}

// Client sent events
interface ClientInit {
  type: 'client_init';
  version: 'v1';
}

interface UserMessage {
  type: 'user_message';
  message: string;
}

interface UserConfirmationResponse {
  type: 'user_confirmation_response';
  response: 'approve' | 'deny';
}

export type ClientEvent = UserMessage | UserConfirmationResponse;

// Server events
interface CallingLlmEvent {
  type: 'llm_call';
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

interface CodeOutput {
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

interface UserConfirmationRequest {
  type: 'user_confirmation_request';
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
