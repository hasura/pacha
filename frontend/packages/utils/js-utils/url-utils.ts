export const stripTrailingSlash = (url: string) => {
  return url && url.endsWith('/') ? url.slice(0, -1) : url;
};

export const addTrailingColon = (str: string) => {
  return str && str.endsWith(':') ? str : str + ':';
};
