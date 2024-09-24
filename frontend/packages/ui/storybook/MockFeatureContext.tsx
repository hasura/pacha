import React from 'react';
import { FeatureContext, FeatureContextData } from '@console/context';

const mockFeatureSet: FeatureContextData = {
  graphQLEndpointType: 'subdomain',
  enabledFeatures: {
    sentryUserTracking: true,
    projectPlans: true,
    launchDarkly: true,
    billing: true,
    chat: {
      local: true,
      cloud: false,
    },
    insights: {
      modelAnalytics: {
        cloud: true,
        local: false,
      },
      performance: {
        cloud: true,
        local: false,
      },
      traces: {
        cloud: true,
        local: false,
      },
      schemaDiff: {
        cloud: true,
        local: false,
      },
    },
    settings: {
      projectSummary: true,
      usage: true,
      collaborators: true,
      subgraphs: true,
      supergraphBuilds: true,
      subgraphBuilds: true,
      connectors: true,
    },
  },
};

export const MockFeatureContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <FeatureContext.Provider value={mockFeatureSet}>
      {children}
    </FeatureContext.Provider>
  );
};
