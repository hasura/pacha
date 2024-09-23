export const formatJSON = (
  json: string | Record<string, any>,
  indent = 2,
  throwError = false
) => {
  if (json) {
    if (typeof json === 'string') {
      try {
        return JSON.stringify(JSON.parse(json), null, indent);
      } catch (e) {
        console.error(e);
        if (throwError) {
          throw e;
        }
      }
    } else {
      return JSON.stringify(json, null, indent);
    }
  }

  return json;
};
