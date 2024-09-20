type TableArtifact = {
  identifier: string;
  artifact_type: string;
  title: string;
  data: Record<string, unknown>[];
  responseMode: ResponseMode;
};

type TextArtifact = {
  identifier: string;
  artifact_type: 'text';
  title: string;
  data: unknown;
  responseMode: ResponseMode;
};

export type Artifact = TableArtifact | TextArtifact;

// Components UI Type

export type ToolCall = {
  name: string;
  call_id: string;
  input: {
    python_code: string; // assuming this is the only input for now
  };
};

export type ToolCallResponse = {
  call_id: string;
  output: {
    output: string;
    error: string | null;
    sql_statements: Array<{ sql: string; result: unknown[] }>;
    modified_artifacts: [];
  };
};

// UI State Types

export type UserConfirmationType = {
  type: 'user_confirmation';
  message: string;
  confirmation_id: string;
  fromHistory?: boolean;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'TIMED_OUT' | 'CANCELED';
  responseMode: ResponseMode;
};

export type SelfMessage = {
  message: string;
  type: 'self';
  responseMode: ResponseMode;
};

export type ErrorResponseType = {
  message: string;
  type: 'error';
  responseMode: ResponseMode;
};
export type ResponseMode = 'stream' | 'history';

export type NewAiResponse =
  | SelfMessage
  | {
      message: unknown;
      type: 'ai' | 'toolchain';
      confirmation_id?: string;
      tool_calls?: ToolCall[];
      threadId: string | null;
      responseMode: ResponseMode;
    }
  | ErrorResponseType
  | UserConfirmationType;

export interface ToolchainResult {
  output: string;
  error: string | null;
  sql_statements: Array<{ sql: string; result: any[] }>;
  modified_artifacts: Artifact[];
}
