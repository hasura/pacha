import React, { useEffect } from 'react';
import {
  Alert,
  Button,
  ButtonProps,
  Image,
  rem,
  Stack,
  StackProps,
} from '@mantine/core';
import { ClientError } from 'graphql-request/build/entrypoints/main';

import { getGraphQLErrorMessage } from '@/control-plane-client';
import { Icons } from '@/ui/icons';
import { hasMessageProperty } from '@/utils/js-utils';
import hasuraErrorLogo from './confused_hasura.png';

function isReactNode(node: unknown): node is React.ReactNode {
  return (
    typeof node === 'string' ||
    typeof node === 'number' ||
    React.isValidElement(node) ||
    (Array.isArray(node) && node.every(isReactNode))
  );
}

export const GenericError = ({
  message,
  title = 'Whoops!',
  onMount,
  width = 250,
  actionButton,
  containerProps,
}: {
  message: React.ReactNode | unknown;
  title?: React.ReactNode;
  actionButton?: Omit<ButtonProps, 'children'> & {
    onClick: () => void;
    text: string;
  };

  onMount?: () => void;
  width?: number;
  containerProps?: StackProps;
  children?: React.ReactNode;
}) => {
  useEffect(() => {
    onMount?.();
  }, []);
  return (
    <Stack
      mt={'25dvh'}
      w={'100%'}
      align="center"
      justify="center"
      {...containerProps}
    >
      <Image src={hasuraErrorLogo} maw={rem(`${width}px`)} alt="hasura-error" />
      <Alert
        w={rem(width * 1.5)}
        title={title}
        color={'red'}
        radius={'md'}
        icon={<Icons.Warning size={50} />}
      >
        <Stack>
          {isReactNode(message)
            ? message
            : hasMessageProperty(message)
              ? message.message
              : 'Unknown error'}
          {actionButton && (
            <Button
              {...actionButton}
              style={{ ...actionButton.style, alignSelf: 'center' }}
            >
              {actionButton.text}
            </Button>
          )}
        </Stack>
      </Alert>
    </Stack>
  );
};

GenericError.GraphQLError = ({
  graphQLError,
}: {
  graphQLError: ClientError;
}) => {
  return (
    <GenericError message={getGraphQLErrorMessage(graphQLError).message} />
  );
};
