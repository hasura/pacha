export type GraphiQLHeader = {
  // we need a stable id that will not change when the key or value changes
  // for the pat/content-type rows we can hard code these
  // for the rest we use a uuid when it's created
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  readonly?: boolean;
  // other properties are stored as constants in the headers-editor constants.ts
};
