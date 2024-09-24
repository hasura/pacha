// moving these properties to constants instead of storage
// this way, we can easily change the behavior of these properties without changing the storage

export const headerTooltips: Record<string, string> = Object.freeze({
  'content-type': `The content type of the request. This should be set to application/json`,
  hasura_cloud_pat: `This is an auto-generated personal access token for accessing your project's GraphQL API.`,
  'x-hasura-role': `When using this header, GraphQL requests will be made with the specified role and permissions defined for the role will be applied.\n\nBy default, requests are made as the role 'admin'.`,
});

export const readOnlyKeys = [
  'content-type',
  'hasura_cloud_pat',
  'authorization',
  'x-hasura-role',
];

export const readOnlyValues = ['content-type', 'hasura_cloud_pat'];

export const maskedKeys = ['hasura_cloud_pat', 'authorization'];
