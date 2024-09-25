import { getRoutes } from '@/routing';

export const DEFAULT_PACHA_ENDPOINT =
  getRoutes().localDev.defaultPachaEndpoint(); // default will be fed externally from the app (console/ pacha repo)

export const PACHA_CHAT_CONFIG_LOCAL_STORAGE_KEY = 'pacha-chat-config';

export const AUTH_TOKEN_HEADER_KEY = 'pacha_auth_token';
