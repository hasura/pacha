import React from 'react';
import {
  // eslint-disable-next-line @typescript-eslint/no-restricted-imports
  TextInput as MantineTextInput,
  TextInputProps as MantineTextInputProps,
} from '@mantine/core';

import { graphQLRegex } from '@/ui/forms';

type Spaces = '_' | '-' | ' ';

export type TextInputProps = MantineTextInputProps & {
  onTextChange?: (text: string) => void;
  sanitizeGraphQL?: boolean;
  sanitizeOptions?: {
    spaceCharacter?: Spaces;
    showDescpription?: boolean;
  };
  forceUpperCase?: boolean;
};

const sanitizeGraphQLFieldNames = (
  value: string,
  spaceCharacter: Spaces = '_'
): string => {
  return value
    .replace(' ', spaceCharacter)
    .replace(graphQLRegex({ spaceCharacter, type: 'replace' }), '');
};

const SANITIZE_DESCRIPTION = `GraphQL field names are limited to alphanumerics and underscores.`;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      onTextChange,
      sanitizeGraphQL,
      forceUpperCase,
      sanitizeOptions,
      ...props
    },
    ref
  ) => {
    return (
      <MantineTextInput
        {...props}
        onChange={e => {
          if (forceUpperCase) {
            e.currentTarget.value = e.currentTarget.value.toUpperCase();
            e.target.value = e.target.value.toUpperCase();
          }

          if (sanitizeGraphQL) {
            // santize both the currentTarget and the target just in case
            e.currentTarget.value = sanitizeGraphQLFieldNames(
              e.currentTarget.value,
              sanitizeOptions?.spaceCharacter ?? '_'
            );

            e.target.value = sanitizeGraphQLFieldNames(
              e.target.value,
              sanitizeOptions?.spaceCharacter ?? '_'
            );
          }

          const value = e.currentTarget.value;

          if (onTextChange) {
            onTextChange(value);
          }

          if (props.onChange) {
            props.onChange(e);
          }
        }}
        description={
          sanitizeOptions?.showDescpription
            ? SANITIZE_DESCRIPTION
            : props.description
        }
        ref={ref}
      />
    );
  }
);
