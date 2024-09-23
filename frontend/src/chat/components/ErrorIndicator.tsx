import { getRoutes, useConsoleParams } from '@/routing';
import { Anchor, Center, Image, Stack, Text, Title } from '@/ui/core';
import notFound from './not-found.png';

const ErrorIndicator = ({ error }: { error?: Error | null }) => {
  const { threadId } = useConsoleParams();

  if (
    threadId &&
    error?.message?.startsWith(`Error loading chat thread:${threadId}`)
  )
    return (
      <Center h={'90vh'} mx={'xl'}>
        <Stack justify="center" align="center">
          {/* <HasuraLogo withText className="mb-6 h-max w-40" /> */}
          <Stack align="center" gap={'xl'}>
            <Title order={3}>Thread Not Found!</Title>
            <Image src={notFound} maw={400} mah={300} fit="contain" />
            <Text size="lg" ta={'center'}>
              The thread{' '}
              <Text fw={600} span>
                {threadId}
              </Text>{' '}
              does not exist or is not accessible.
              <br /> This could also be due to a network or pacha connection
              config error.
              <br />
              <br /> Try starting a{' '}
              <Anchor href={getRoutes().localDev.chat()}>new chat</Anchor> or
              check your connection settings.
            </Text>
          </Stack>
        </Stack>
      </Center>
    );

  return null;
};

export default ErrorIndicator;
