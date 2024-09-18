import { useEffect, useRef } from 'react';
import { ErrorBoundary } from '@/common/ErrorBoundary';

import {
  Accordion,
  Badge,
  Box,
  Button,
  Card,
  CopyActionIcon,
  Divider,
  GenericError,
  Grid,
  Group,
  Paper,
  Text,
  Title,
} from '@/ui/core';
import { useSchemeColors } from '@/ui/hooks';
import { Icons } from '@/ui/icons';
import { Artifact } from '../types';
import useSelectedArtifacts from '../useSelectedArtifacts';
import { downloadObjectAsCsv, downloadObjectAsJson } from '../utils';
import DynamicTable from './DynamicTable';

export const Artifacts = ({
  artifacts,
  height,
  isMinimized,
  setIsMinimized,
}: {
  artifacts: Artifact[];
  height: string;
  setIsMinimized: (isMinimized: boolean) => void;
  isMinimized: boolean;
}) => {
  const { bg, text } = useSchemeColors();
  const canShowArtifactsExpandButton = artifacts?.length > 0 && isMinimized;

  const prevArtifacts = useRef<Artifact[]>(artifacts ?? []);
  const { updateSelectedArtifacts } = useSelectedArtifacts();

  useEffect(() => {
    if (artifacts.length > prevArtifacts.current.length) {
      // when new artifacts are added, select the latest one
      updateSelectedArtifacts([artifacts[0].identifier]);
      setIsMinimized(false);
    }
    prevArtifacts.current = artifacts;
  }, [artifacts, updateSelectedArtifacts, setIsMinimized]);

  return (
    <>
      {/* Button section when Artifacts are minimized */}
      <Paper
        radius="md"
        withBorder
        m="md"
        className="absolute right-0 top-0 z-10 cursor-pointer hover:shadow-sm"
        style={{
          transition: 'all 0.3s ease-in-out',
          opacity: canShowArtifactsExpandButton ? 1 : 0,
          transform: canShowArtifactsExpandButton
            ? 'translateY(0)'
            : 'translateY(-20px)',
          pointerEvents: canShowArtifactsExpandButton ? 'auto' : 'none',
        }}
      >
        <Button
          color={'gray'}
          variant="outline"
          onClick={() => setIsMinimized(false)}
          leftSection={<Icons.Artifacts size={18} />}
          rightSection={
            <Badge size="lg" circle mr="md">
              {artifacts.length}
            </Badge>
          }
        >
          Memory Artifacts
        </Button>
      </Paper>

      {/* Artifacts section when Artifacts are not minimized */}
      {artifacts?.length > 0 && !isMinimized ? (
        <Grid.Col span={6} mah={height} w={100}>
          <Paper
            radius={0}
            h={height}
            miw="100%"
            maw="100%"
            withBorder
            bg={bg.level2}
          >
            <Group py="md" px="lg" justify="space-between">
              <Group h={20} align="center">
                <Icons.Artifacts />
                <Title order={5}>Memory Artifacts</Title>
                <Badge size="lg" circle>
                  {artifacts.length}
                </Badge>
              </Group>
              <Button
                variant="subtle"
                size="compact-sm"
                color={text.normal}
                onClick={() => setIsMinimized(true)}
              >
                <Icons.Close />
              </Button>
            </Group>
            <Divider />
            <Box
              style={{ overflowY: 'auto', height: `calc(${height} - 100px)` }}
            >
              <Card p={0} radius="md" m="lg" withBorder>
                <ArtifactsList artifacts={artifacts} />
              </Card>
            </Box>
          </Paper>
        </Grid.Col>
      ) : null}
    </>
  );
};

const ArtifactsList = ({ artifacts }: { artifacts: Artifact[] }) => {
  const { selectedArtifacts, updateSelectedArtifacts } = useSelectedArtifacts();

  const handleDownload = (artifact: Artifact) => {
    if (artifact.artifact_type === 'table') {
      downloadObjectAsCsv(artifact.data, artifact.title);
    } else {
      downloadObjectAsJson(artifact.data, artifact.title);
    }
  };

  return (
    <Accordion
      multiple
      value={selectedArtifacts}
      onChange={updateSelectedArtifacts}
    >
      {artifacts.map(artifact => (
        <Accordion.Item key={artifact.identifier} value={artifact.identifier}>
          <Accordion.Control icon={<Icons.Table />}>
            <Group justify="space-between" style={{ width: '100%' }}>
              <Text>{artifact.title}</Text>
              {selectedArtifacts.includes(artifact.identifier) && (
                <Group px="xs">
                  <CopyActionIcon
                    toCopy={JSON.stringify(artifact.data)}
                    variant="subtle"
                    color="gray"
                    tooltipMessage="Copied Artifact Data!"
                  />
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    onClick={e => {
                      e.stopPropagation();
                      handleDownload(artifact);
                    }}
                  >
                    <Icons.FaDownload />
                  </Button>
                </Group>
              )}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <ArtifactViewer artifact={artifact} />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

const ArtifactViewer = ({ artifact }: { artifact: Artifact }) => {
  return artifact.artifact_type === 'table' ? (
    <ErrorBoundary
      errorHandler={err => <GenericError message={err?.message ?? ''} />}
    >
      <DynamicTable data={artifact.data} />
    </ErrorBoundary>
  ) : (
    <ErrorBoundary
      errorHandler={err => <GenericError message={err?.message ?? ''} />}
    >
      <Text size="sm">{JSON.stringify(artifact.data, null, 2)}</Text>
    </ErrorBoundary>
  );
};

export default Artifacts;
