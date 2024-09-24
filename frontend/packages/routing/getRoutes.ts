// getRoutes().localDev.chat()

export const getRoutes = () => {
  return {
    localDev: {
      chat: () => '/chat',
      chatThread: (threadId: string) => `/chat/thread/${threadId}`,
      defaultPachaEndpoint: () => `http://localhost:5000`,
      chatThreadLink: (threadId: string) =>
        `${window.location.origin}/chat/thread/${threadId}`,
    },
  };
};
