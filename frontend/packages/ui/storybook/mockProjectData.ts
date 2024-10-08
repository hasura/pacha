import { ProjectContextData } from '@console/context';

import { DDN_PLANS } from '@/data/project-data';

/**
 *
 * The best place to grab example project context data is from the console.log in the ProjectRouter.tsx file.
 *
 */
export const mockProjectData = {
  project: {
    id: '6e3556cb-c4bf-44ae-8e3a-fd03232d0e8d',
    name: 'mock-storybook-1234',
    owner_id: '7d003007-b47d-43db-b529-c9062e98cc93',
    created_at: '2024-04-16T02:34:31.762426+00:00',
    plan_name: DDN_PLANS.ddn_free,
    private_ddn: {
      fqdn: 'ddn.hasura.me',
      name: 'hasura-public',
      ddn_kind: 'self_hosted',
    },
    can_request_access: false,
  },
  environment: {
    created_at: '2024-04-16T02:34:31.762426+00:00',
    current_build_id: null,
    deleted_at: null,
    description: null,
    fqdn: 'mock-storybook-1234.ddn.hasura.me',
    id: '4f1defd4-5bfe-4f58-a38c-fcca31fd9871',
    name: 'default',
    updated_at: '2024-04-16T02:34:31.762426+00:00',
    most_recent_build: [
      {
        id: 'ef95e320-a661-4a27-aae9-4dfed3a9da27',
        version: 'dcc8a01bb5',
        created_at: '2024-04-16T02:40:59.775726+00:00',
      },
    ],
  },
  environments: [
    {
      created_at: '2024-04-16T02:34:31.762426+00:00',
      current_build_id: null,
      deleted_at: null,
      description: null,
      fqdn: 'mock-storybook-1234.ddn.hasura.me',
      id: '4f1defd4-5bfe-4f58-a38c-fcca31fd9871',
      name: 'default',
      updated_at: '2024-04-16T02:34:31.762426+00:00',
      most_recent_build: [
        {
          id: 'ef95e320-a661-4a27-aae9-4dfed3a9da27',
          version: 'dcc8a01bb5',
          created_at: '2024-04-16T02:40:59.775726+00:00',
        },
      ],
    },
  ],
  environmentBuilds: [
    {
      created_at: '2024-04-16T02:40:59.775726+00:00',
      deleted_at: null,
      description: null,
      fqdn: 'mock-storybook-1234-dcc8a01bb5.ddn.hasura.me',
      id: 'ef95e320-a661-4a27-aae9-4dfed3a9da27',
      version: 'dcc8a01bb5',
      updated_at: '2024-04-16T02:40:59.775726+00:00',
      build_author: {
        user: {
          email: 'matthew.goodwin@hasura.io',
        },
      },
    },
  ],
  build: {
    created_at: '2024-04-16T02:40:59.775726+00:00',
    deleted_at: null,
    description: null,
    fqdn: 'mock-storybook-1234-dcc8a01bb5.ddn.hasura.me',
    id: 'ef95e320-a661-4a27-aae9-4dfed3a9da27',
    version: 'dcc8a01bb5',
    updated_at: '2024-04-16T02:40:59.775726+00:00',
    build_author: {
      user: {
        email: 'matthew.goodwin@hasura.io',
      },
    },
  },
  user: {
    id: '7d003007-b47d-43db-b529-c9062e98cc93',
    email: 'matthew.goodwin@hasura.io',
    customer_id: 'cus_OW8yeyqnWvNUOu',
  },
} satisfies ProjectContextData;
