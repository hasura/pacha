// getRoutes().localDev.chat()

export const getRoutes = () => {
  return {
    localDev: {
      chat: () => '/chat',
      chatThread: (threadId: string) => `/chat/thread/${threadId}`,
      chatThreadLink: (threadId: string) =>
        `${window.location.origin}/chat/thread/${threadId}`,
    },
  };
};
