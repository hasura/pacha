import { useCallback, useState } from 'react';

import { wait } from '@/utils/js-utils';

function isSpaceOrNewline(char: string) {
  try {
    return !!char.match(/[\s\n]/);
  } catch {
    return false;
  }
}

async function streamTextByWord(
  text: string,
  speed: number,
  onUpdate: (text: string) => void
) {
  for (let index = 0; index <= text.length; index++) {
    // only call update on spaces and newlines
    if (isSpaceOrNewline(text[index])) {
      onUpdate(text.slice(0, index));

      // pause here to simulate streaming word by word
      await wait(speed);
    }
  }
  // do a final update to ensure the full text is passed at the end
  onUpdate(text);
}

type StreamTextOptions = {
  speed?: number; // Speed in milliseconds per character
  onUpdate?: (text: string) => void;
};

export const useStreamText = (options: StreamTextOptions = {}) => {
  const { speed = 50, onUpdate } = options;
  const [streamingText, setStreamingText] = useState('');
  const [streamStatus, setStreamStatus] = useState<
    'idle' | 'streaming' | 'completed'
  >('idle');

  const startStreaming = useCallback(
    (text: string) =>
      new Promise<void>(resolve => {
        setStreamingText('');
        setStreamStatus('streaming');

        streamTextByWord(text, speed, updatedText => {
          setStreamingText(updatedText);
          onUpdate?.(updatedText);
        })
          .then(() => {
            setStreamStatus('completed');
          })
          .finally(() => {
            resolve();
          });
      }),
    [speed]
  );

  return {
    startStreaming,
    streamingText,
    streamStatus,
  };
};
