import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { SUBROUTE_PARAMS } from '@/routing';
import { LoadingMessage } from '@/ui/core';

const Chat = lazy(() =>
  import('./chat/ChatV2').then(m => ({
    default: m.ChatPageShell,
  }))
);

export function ChatRouter() {
  return (
    <Suspense fallback={<LoadingMessage>Loading chat routes</LoadingMessage>}>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route
          path={`/thread/${SUBROUTE_PARAMS.threadId}`}
          element={<Chat />}
        />
      </Routes>
    </Suspense>
  );
}
