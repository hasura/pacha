import { ThreadResponse } from './data/Api-Types-v3';
import {
  AiMessage,
  Artifact,
  NewAiResponse,
  ToolCallResponse,
  ToolchainResult,
  UserConfirmationType,
} from './types';

export const extractModifiedArtifacts = (data: NewAiResponse[]): Artifact[] => {
  const artifactMap = new Map<string, Artifact>();

  data.forEach(item => {
    if (item.type === 'toolchain') {
      try {
        const parsedMessage: ToolchainResult =
          typeof item.message === 'string'
            ? JSON.parse(item.message)
            : item.message;

        if (
          parsedMessage.modified_artifacts &&
          parsedMessage.modified_artifacts.length > 0
        ) {
          parsedMessage.modified_artifacts.forEach(artifact => {
            if (artifact.identifier) {
              artifactMap.set(artifact.identifier, {
                ...artifact,
                responseMode: item.responseMode,
              });
            }
          });
        }
      } catch (error) {
        console.error('Error parsing toolchain message:', error);
      }
    }
  });

  return Array.from(artifactMap.values()).reverse();
};

export const processMessageHistory = (resp: ThreadResponse) => {
  const history: NewAiResponse[] = [];
  const toolcallResponses: ToolCallResponse[] = [];
  const interactions = resp.state.interactions;

  interactions?.forEach(interaction => {
    history.push({
      message: interaction?.user_message?.message,
      type: 'self',
      threadId: resp.thread_id,
      responseMode: 'history',
    } as NewAiResponse);
    interaction.assistant_actions.forEach(item => {
      const newVal = {
        message: item.message,
        type: 'ai',
        threadId: resp.thread_id,
        tool_calls: [],
        responseMode: 'history',
        assistant_action_id: item.action_id,
      } as AiMessage;

      if (item.code && item.code?.code_block_id) {
        newVal.tool_calls = [
          {
            call_id: item.code.code_block_id,
            input: {
              python_code: item.code.code,
            },
          },
        ];
        toolcallResponses.push({
          call_id: item.code.code_block_id,
          output: {
            output: item?.code?.output ?? '',
            error: item.code.error ?? null,
            sql_statements:item.code.sql_statements,
            modified_artifacts: [],
          },
        });
      }

      history.push(newVal);
    });
  });
  return { history, toolcallResponses };
};

export function downloadObjectAsCsv(
  objArray: Record<string, unknown>[],
  filename: string
): void {
  if (!Array.isArray(objArray) || objArray.length === 0) {
    console.error('Invalid input: Expected an array of objects');
    return;
  }

  // Ensure all elements in the array are objects
  if (!objArray.every(item => typeof item === 'object' && item !== null)) {
    console.error('Invalid input: Array elements should be objects');
    return;
  }
  try {
    // TypeScript now knows that objArray contains objects
    const keys = Object.keys(objArray[0]);

    const csvString = [
      keys.join(','), // Header row
      ...objArray.map(obj =>
        keys
          .map(key => {
            const value = (obj as Record<string, unknown>)[key];
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv' });

    // Create a temporary anchor element
    const link = document.createElement('a');

    // Create a URL for the Blob and set it as the href attribute
    link.href = URL.createObjectURL(blob);

    // Set the download attribute with the desired file name
    link.download = `${filename}.csv`;

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading CSV:', error);
  }
}
export function downloadObjectAsJson(obj: unknown, filename: string): void {
  try {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(obj, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a temporary anchor element
    const link = document.createElement('a');

    // Create a URL for the Blob and set it as the href attribute
    link.href = URL.createObjectURL(blob);

    // Set the download attribute with the desired file name
    link.download = `${filename}.json`;

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading JSON:', error);
  }
}

export const safeJSONParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};
