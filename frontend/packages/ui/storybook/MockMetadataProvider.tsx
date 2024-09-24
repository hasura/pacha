/* eslint-disable no-console */
import { MetadataContext, MetadataContextData } from '@console/context';
import { contextDataFromMetadata } from '@console/context/metadata/contextDataFromMetadata';
import { generateMockMetadata } from '@console/features/metadata-explorer/Visualization/generateMockMetadata';

import { Metadata } from '@/utils/metadata-types';
import { mockMetadata } from './mockMetadata';

// Store the metadata in local storage to avoid re-generating it on every page load
// Store legacy keys to clean up old data, otherwise local storage quickly fills up due to the large size of the metadata
const legacyStorageKeys = ['mockMetadata'];
const storageKey = 'mockMetadata-v1';

function getStressTestMetadata(): Metadata {
  const params = {
    subgraphCount: 3,
    dataSourcesPerSubgraph: 2,
    maxModelsPerSubgraph: 8000,
    maxCommandsPerSubgraph: 100,
    maxRelationshipsPerSubgraph: 800,
  };

  const stored = localStorage.getItem(storageKey);

  const hasValidStoredData =
    stored &&
    JSON.stringify(params) === JSON.stringify(JSON.parse(stored).params);

  if (hasValidStoredData) {
    const data = JSON.parse(stored);

    return data.data;
  } else {
    localStorage.removeItem(storageKey);
    legacyStorageKeys.forEach(key => localStorage.removeItem(key));

    const data = generateMockMetadata(params);
    const store = { params, data };

    localStorage.setItem(storageKey, JSON.stringify(store));
    console.timeEnd('getMockMetadata');
    return data;
  }
}

export function MockMetadataProvider({
  children,
  render,
  useStressTest,
}: {
  children?: React.ReactNode;
  render?: (metadata: MetadataContextData) => React.ReactNode;
  useStressTest?: boolean;
}) {
  const providerMetadata = useStressTest
    ? getStressTestMetadata()
    : mockMetadata;

  const ctxData = contextDataFromMetadata(providerMetadata, {
    id: 'ef95e320-a661-4a27-aae9-4dfed3a9da27',
    version: 'dcc8a01bb5',
  });
  return (
    <MetadataContext.Provider value={ctxData}>
      {render ? render(ctxData) : children}
    </MetadataContext.Provider>
  );
}
