import { Thread } from './data/api-types-v2';
import {
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

export const processMessageHistory = (data: Thread) => {
  const history: NewAiResponse[] = [];
  const toolcallResponses: ToolCallResponse[] = [];

  const userConfirmationsMap = data?.user_confirmations?.reduce(
    (acc, confirmation) => {
      acc[confirmation.confirmation_id] = confirmation.status;
      return acc;
    },
    {} as Record<string, UserConfirmationType['status']>
  );

  data?.history?.forEach(item => {
    if (item.type === 'user') {
      // set user message
      history.push({
        message: item.text,
        type: 'self',
        threadId: data.thread_id,
        responseMode: 'history',
      } as NewAiResponse);
    } else if (item.type === 'assistant') {
      // set assistant message
      history.push({
        message: item.text,
        type: 'ai',
        threadId: data.thread_id,
        tool_calls: item.tool_calls,
        responseMode: 'history',
      } as NewAiResponse);
    } else if (item.type === 'user_confirmation_request') {
      history.push({
        message: item.message,
        type: 'user_confirmation',
        confirmation_id: item.confirmation_id,
        fromHistory: true,
        responseMode: 'history',
        status: userConfirmationsMap[item.confirmation_id],
      } as UserConfirmationType);
    } else if (item.type === 'tool_response') {
      item.tool_responses.forEach(toolResponse => {
        history.push({
          message: toolResponse.output,
          type: 'toolchain',
          threadId: data.thread_id,
          responseMode: 'history',
        } as NewAiResponse);

        toolcallResponses.push({
          call_id: toolResponse.call_id,
          output: toolResponse.output,
        } as ToolCallResponse);
      });
    }
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
