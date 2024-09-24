import React, { useContext } from 'react';

import { Button, Card, Flex, Text } from '@/ui/core';
import { useSchemeColors } from '@/ui/hooks';
import { Icons } from '@/ui/icons';
import { PachaChatContext } from '../PachaChatContext';
import { NewAiResponse, ToolCall, ToolCallResponse } from '../types';
import useSelectedArtifacts from '../useSelectedArtifacts';
import ToolChainMessage from './ToolChainMessage';

interface ArtifactTextProps {
  text: string | undefined;
}

const ArtifactText: React.FC<ArtifactTextProps> = ({ text }) => {
  const { setIsMinimized } = useContext(PachaChatContext);
  const { updateSelectedArtifacts } = useSelectedArtifacts();

  if (!text) return <Text>No content</Text>;

  const parts: string[] = text.split(/(<artifact.*?\/>\s*)/);

  const handleArtifactClick = (identifier: string) => {
    updateSelectedArtifacts([identifier]);
    setIsMinimized(false);
  };

  return (
    <>
      {parts.map((part: string, index: number) => {
        if (part.startsWith('<artifact')) {
          // Extract the identifier from the artifact tag
          // eg response may contain <artifact identifier="my_artifact_id" />
          // we want to extract "my_artifact_id"
          const match: RegExpMatchArray | null = part?.match(
            /identifier=['"]([^'"]*)['"]/
          );
          const identifier: string = match ? match[1] : 'Artifact';
          return (
            <Flex key={index}>
              <Button
                justify="center"
                leftSection={<Icons.FaFileAlt size={14} />}
                variant="default"
                my="xs"
                onClick={() => handleArtifactClick(identifier)}
              >
                {identifier}
              </Button>
            </Flex>
          );
        } else {
          return (
            <Text
              key={index}
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {part}
            </Text>
          );
        }
      })}
    </>
  );
};

export function AssistantResponse({
  data,
  toolCallResponses,
}: {
  data: NewAiResponse;
  toolCallResponses: ToolCallResponse[];
}) {
  const { bg } = useSchemeColors();
  return (
    <Card
      style={{ alignSelf: 'flex-start' }}
      my={'lg'}
      maw="100%"
      miw="100%"
      bg={bg.level1}
      withBorder
      p={'md'}
      radius={'md'}
    >
      <ArtifactText text={(data?.message as string) ?? 'Generated Artifact'} />

      {data?.type == 'ai' &&
        data?.tool_calls?.map((i: ToolCall) => (
          <ToolChainMessage
            key={i.call_id}
            data={i}
            toolCallResponses={toolCallResponses}
          />
        ))}
    </Card>
  );
}
export default AssistantResponse;
