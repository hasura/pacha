import { Alert, Button, Card, Group, Text, Title } from '@/ui/core';
import { useSchemeColors } from '@/ui/hooks';
import { Icons } from '@/ui/icons';
import { CodeMirrorProvider, ReactCodeMirror } from '@/ui/lazy';
import { UserConfirmationType } from '../types';
import { safeJSONParse } from '../utils';

const getAlertRendereConfig = ({
  isApproved,
  isDenied,
  isCanceled,
  isTimedOut,
}: {
  isApproved: boolean;
  isDenied: boolean;
  isCanceled: boolean;
  isTimedOut: boolean;
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

  // const { update, loading, error, status } = useUserConfirmation();
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
  });
  const update = (b: 'approve' | 'deny') => {
    data.client?.sendMessage({
      type: 'user_confirmation_response',
      response: b,
      confirmation_request_id: data.confirmation_id,
    });
  };

  return (
    <Card bg={bg.level1} withBorder maw={'100%'} miw={'100%'}>
      {/* <LoadingOverlay visible={loading} /> */}
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
            onClick={() => update('deny')}
          >
            Deny
          </Button>
          <Button disabled={!!status} onClick={() => update('approve')}>
            Approve {'>'}
          </Button>
        </Group>
      ) : null}
    </Card>
  );
};

export default ActionAuthorizeCard;
