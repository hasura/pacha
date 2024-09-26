type Spaces = '_' | '-' | ' ';

export const graphQLRegex = ({
  spaceCharacter = '_',
  type,
}: {
  spaceCharacter?: Spaces;
  type: 'replace' | 'match';
}) =>
  new RegExp(
    `[${type === 'replace' ? '^' : ''}A-Za-z0-9${spaceCharacter}]`,
    'g'
  );
