import { useConsoleParams } from '@/routing';
import {
  Alert,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Text,
  Title,
} from '@/ui/core';
import { useSchemeColors } from '@/ui/hooks';
import { Icons } from '@/ui/icons';
import { CodeMirrorProvider, ReactCodeMirror } from '@/ui/lazy';
import { UserConfirmationType } from '../types';
import useUserConfirmation from '../useUserConfirmation';
import { safeJSONParse } from '../utils';

const getAlertRendereConfig = ({
  isApproved,
  isDenied,
  isCanceled,
  isTimedOut,
  error,
}: {
  isApproved: boolean;
  isDenied: boolean;
  isCanceled: boolean;
  isTimedOut: boolean;
  error: Error | null;
}) => {
  if (isApproved)
    return {
      variant: 'light',
      color: 'green',
      title: 'Approved',
      message: 'You have approved the action',
      icon: <Icons.CheckCircle />,
    };
  if (isDenied)
    return {
      variant: 'light',
      color: 'red',
      title: 'Denied',
      icon: <Icons.Environment />,
      message: 'You have denied the action. The action will not be executed.',
    };
  if (isCanceled)
    return {
      variant: 'light',
      color: 'red',
      title: 'Canceled',
      icon: <Icons.Environment />,
      message: 'You have canceled the action. The action will not be executed.',
    };
  if (isTimedOut)
    return {
      variant: 'light',
      color: 'red',
      title: 'Timed Out',
      icon: <Icons.Environment />,
      message: 'Action timed out. The action will not be executed.',
    };
  if (error)
    return {
      variant: 'light',
      color: 'red',
      title: 'Error',
      icon: <Icons.Environment />,
      message: 'Error updating the confirmation status. Please try again.',
    };
  return null;
};

const ActionAuthorizeCard = ({
  data,
  hasNextAiMessage,
}: {
  data: UserConfirmationType;
  hasNextAiMessage: boolean;
}) => {
  const { bg } = useSchemeColors();
  const { threadId } = useConsoleParams();

  const { update, loading, error, status } = useUserConfirmation();
  const isApproved = status === 'approved' || data?.status === 'APPROVED';
  const isDenied = status === 'denied' || data?.status === 'DENIED';
  const isCanceled = data?.status === 'CANCELED';
  const isTimedOut = data?.status === 'TIMED_OUT';

  const canShowActionItems =
    !isApproved && !isDenied && !isTimedOut && !isCanceled && !hasNextAiMessage;

  const alertRendererConfig = getAlertRendereConfig({
    isApproved,
    isDenied,
    isCanceled,
    isTimedOut,
    error,
  });

  return (
    <Card bg={bg.level1} withBorder maw={'100%'} miw={'100%'}>
      <LoadingOverlay visible={loading} />
      <Card.Section withBorder inheritPadding py="sm">
        <Title order={5} size="sm">
          Action Required
        </Title>
      </Card.Section>
      <Text my="sm" size="sm">
        You are about to make a permanent change to your data. I can only
        proceed on your explicit approval. Do you want to continue?
      </Text>
      <CodeMirrorProvider>
        {({ language, sqlModes }) => (
          <ReactCodeMirror
            className="size-full border border-slate-300 dark:border-secondary-500"
            value={safeJSONParse(data?.message)}
            readOnly
            extensions={[language.StreamLanguage.define(sqlModes.pgSQL)]}
          />
        )}
      </CodeMirrorProvider>
      {alertRendererConfig ? (
        <Alert
          variant={alertRendererConfig.variant}
          color={alertRendererConfig.color}
          title={alertRendererConfig.title}
          my="xs"
          icon={alertRendererConfig.icon}
        >
          {alertRendererConfig.message}
        </Alert>
      ) : null}

      {canShowActionItems ? (
        <Group justify="flex-end" my="xs">
          <Button
            disabled={!!status}
            variant="light"
            onClick={() => update(data?.confirmation_id, threadId ?? '', false)}
          >
            Deny
          </Button>
          <Button
            disabled={!!status}
            onClick={() => update(data?.confirmation_id, threadId ?? '', true)}
          >
            Approve {'>'}
          </Button>
        </Group>
      ) : null}
    </Card>
  );
};

export default ActionAuthorizeCard;
