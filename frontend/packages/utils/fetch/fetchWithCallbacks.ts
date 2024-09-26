export async function fetchWithCallbacks<T = unknown>({
  url,
  options = {},
  onSuccess = () => {},
  onError = () => {},
  processResponse,
  onComplete = () => {},
}: {
  url: string;
  options?: RequestInit;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onComplete?: VoidFunction;
  processResponse: (response: Response) => Promise<T>;
}): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorResponse = response.clone();
      let errorDetail = '';
      try {
        const errorJson = await errorResponse.json();
        errorDetail = errorJson.message || JSON.stringify(errorJson);
      } catch (e) {
        errorDetail = 'Failed to read error details from response body.';
      }
      const error = new Error(
        `Fetch error from ${url}. Status code: ${response.status} (${response.statusText}). Error details: ${errorDetail}`
      );

      onError(error); // Pass the error object to onError.

      throw error;
    }

    const data = await processResponse(response);

    onSuccess(data); // Pass the processed data to onSuccess.
    onComplete();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      onError(error); // Ensure onError is called with the Error object.
    } else {
      onError(new Error('An unknown error occurred'));
    }

    // call onComplete just before throwing the error to the caller
    onComplete();
    throw error;
  }
}
