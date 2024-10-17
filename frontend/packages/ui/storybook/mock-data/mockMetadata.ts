import { Metadata } from '@/utils/metadata-types';

/**
 * The best place to get metadata to replace this with is to console.log() the metadata from the useBuildDataWithMetadata hook
 */
export const mockMetadata: Metadata = {
  version: 'v1',
  supergraph: {
    objects: [
      {
        kind: 'AuthConfig',
        version: 'v1',
        definition: {
          allowRoleEmulationBy: 'admin',
          mode: {
            webhook: {
              url: 'http://auth-hook.default:8080/webhook/ddn?role=admin',
              method: 'Post',
            },
          },
        },
      },
      {
        kind: 'CompatibilityConfig',
        date: '2024-04-03',
      },
      {
        kind: 'GraphqlConfig',
        version: 'v1',
        definition: {
          query: {
            rootOperationTypeName: 'Query',
            argumentsInput: {
              fieldName: 'args',
            },
            limitInput: {
              fieldName: 'limit',
            },
            offsetInput: {
              fieldName: 'offset',
            },
            filterInput: {
              fieldName: 'where',
              operatorNames: {
                and: '_and',
                or: '_or',
                not: '_not',
                isNull: '_is_null',
              },
            },
            orderByInput: {
              fieldName: 'order_by',
              enumDirectionValues: {
                asc: 'Asc',
                desc: 'Desc',
              },
              enumTypeNames: [
                {
                  directions: ['Asc', 'Desc'],
                  typeName: 'OrderBy',
                },
              ],
            },
          },
          mutation: {
            rootOperationTypeName: 'Mutation',
          },
        },
      },
    ],
  },
  subgraphs: [
    {
      name: 'sales',
      objects: [
        {
          kind: 'Command',
          version: 'v1',
          definition: {
            name: 'GetGithubProfileDescription',
            graphql: {
              rootFieldName: 'sales_getGithubProfileDescription',
              rootFieldKind: 'Query',
            },
            description: 'Returns the github bio for the userid provided',
            arguments: [
              {
                name: 'username',
                type: 'String!',
                description: "Username of the user who's bio will be fetched.",
              },
            ],
            source: {
              dataConnectorName: 'sales_functions',
              dataConnectorCommand: {
                function: 'get_github_profile_description',
              },
            },
            outputType: 'String',
          },
        },
        {
          kind: 'Command',
          version: 'v1',
          definition: {
            name: 'GetGithubProfileDescriptionNoparallel',
            graphql: {
              rootFieldName: 'sales_getGithubProfileDescriptionNoparallel',
              rootFieldKind: 'Query',
            },
            description: 'Returns the github bio for the userid provided',
            arguments: [
              {
                name: 'username',
                type: 'String!',
                description: "Username of the user who's bio will be fetched.",
              },
            ],
            source: {
              dataConnectorName: 'sales_functions',
              dataConnectorCommand: {
                function: 'get_github_profile_description_noparallel',
              },
            },
            outputType: 'String',
          },
        },
        {
          kind: 'Command',
          version: 'v1',
          definition: {
            name: 'Hello',
            graphql: {
              rootFieldName: 'sales_hello',
              rootFieldKind: 'Query',
            },
            arguments: [
              {
                name: 'name',
                type: 'String',
              },
            ],
            source: {
              dataConnectorName: 'sales_functions',
              dataConnectorCommand: {
                function: 'hello',
              },
            },
            outputType: 'String!',
          },
        },
        {
          kind: 'Command',
          version: 'v1',
          definition: {
            name: 'ToCurrencyString',
            graphql: {
              rootFieldName: 'sales_toCurrencyString',
              rootFieldKind: 'Query',
            },
            description: 'Formats a number into a currency string.',
            arguments: [
              {
                name: 'amount',
                type: 'Float',
                description: 'The number to format into currency.',
              },
            ],
            source: {
              dataConnectorName: 'sales_functions',
              dataConnectorCommand: {
                function: 'toCurrencyString',
              },
            },
            outputType: 'String!',
          },
        },
        {
          kind: 'Command',
          version: 'v1',
          definition: {
            name: 'ToDateString',
            graphql: {
              rootFieldName: 'sales_toDateString',
              rootFieldKind: 'Query',
            },
            description: 'Formats a date string to a human-readable format.',
            arguments: [
              {
                name: 'date',
                type: 'String',
                description: 'The date string to format.',
              },
            ],
            source: {
              dataConnectorName: 'sales_functions',
              dataConnectorCommand: {
                function: 'toDateString',
              },
            },
            outputType: 'String!',
          },
        },
        {
          kind: 'CommandPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                allowExecution: true,
              },
            ],
            commandName: 'GetGithubProfileDescription',
          },
        },
        {
          kind: 'CommandPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                allowExecution: true,
              },
            ],
            commandName: 'GetGithubProfileDescriptionNoparallel',
          },
        },
        {
          kind: 'CommandPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                allowExecution: true,
              },
            ],
            commandName: 'Hello',
          },
        },
        {
          kind: 'CommandPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                allowExecution: true,
              },
            ],
            commandName: 'ToCurrencyString',
          },
        },
        {
          kind: 'CommandPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                allowExecution: true,
              },
            ],
            commandName: 'ToDateString',
          },
        },
        {
          kind: 'DataConnectorLink',
          version: 'v1',
          definition: {
            name: 'db3',
            url: {
              singleUrl: {
                value:
                  'http://c2-u45lxvt0v7.gcp.postgres.ndc.internal/deployment/1d163f17-46c2-442c-ab14-5d6560108202',
              },
            },
            schema: {
              version: 'v0.1',
              schema: {
                scalar_types: {
                  bool: {
                    aggregate_functions: {
                      bool_and: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      bool_or: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      every: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                    },
                  },
                  int4: {
                    aggregate_functions: {
                      bit_and: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      bit_or: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      bit_xor: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                    },
                  },
                  text: {
                    aggregate_functions: {
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _ilike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _iregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _like: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nilike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _niregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nlike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _regex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      starts_with: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      ts_match_tt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  timestamptz: {
                    aggregate_functions: {
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                  },
                  uuid: {
                    aggregate_functions: {},
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  vector: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                    },
                  },
                },
                object_types: {
                  cart_items: {
                    fields: {
                      cart_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      quantity: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                    },
                  },
                  carts: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_complete: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      is_reminder_sent: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  categories: {
                    fields: {
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  coupons: {
                    fields: {
                      amount: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'int4',
                          },
                        },
                      },
                      code: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      expiration_date: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      percent_or_value: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'text',
                          },
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  manufacturers: {
                    fields: {
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  notifications: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      message: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  orders: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      delivery_date: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_reviewed: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      status: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  products: {
                    fields: {
                      category_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      country_of_origin: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      description: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      image: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      manufacturer_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      price: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      vector: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'vector',
                          },
                        },
                      },
                    },
                  },
                  reviews: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_visible: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      rating: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      text: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  users: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      email: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      favorite_artist: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'int4',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_email_verified: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'bool',
                          },
                        },
                      },
                      last_seen: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      password: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'text',
                          },
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                  },
                },
                collections: [
                  {
                    name: 'cart_items',
                    arguments: {},
                    type: 'cart_items',
                    uniqueness_constraints: {
                      cart_items_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      cart_items_cart_id_foreign: {
                        column_mapping: {
                          cart_id: 'id',
                        },
                        foreign_collection: 'carts',
                      },
                      cart_items_product_id_foreign: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                    },
                  },
                  {
                    name: 'carts',
                    arguments: {},
                    type: 'carts',
                    uniqueness_constraints: {
                      carts_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      carts_user_id_foreign: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'categories',
                    arguments: {},
                    type: 'categories',
                    uniqueness_constraints: {
                      categories_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'coupons',
                    arguments: {},
                    type: 'coupons',
                    uniqueness_constraints: {
                      coupons_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      coupons_user_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'manufacturers',
                    arguments: {},
                    type: 'manufacturers',
                    uniqueness_constraints: {
                      manufacturers_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'notifications',
                    arguments: {},
                    type: 'notifications',
                    uniqueness_constraints: {
                      notifications_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      notifications_user_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'orders',
                    arguments: {},
                    type: 'orders',
                    uniqueness_constraints: {
                      orders_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      orders_customer_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                      orders_product_id_fkey: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                    },
                  },
                  {
                    name: 'products',
                    arguments: {},
                    type: 'products',
                    uniqueness_constraints: {
                      products_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      products_category_foreign: {
                        column_mapping: {
                          category_id: 'id',
                        },
                        foreign_collection: 'categories',
                      },
                      products_manufacturer_foreign: {
                        column_mapping: {
                          manufacturer_id: 'id',
                        },
                        foreign_collection: 'manufacturers',
                      },
                    },
                  },
                  {
                    name: 'reviews',
                    arguments: {},
                    type: 'reviews',
                    uniqueness_constraints: {
                      reviews_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      reviews_product_id_foreign: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                      reviews_user_id_foreign: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'users',
                    arguments: {},
                    type: 'users',
                    uniqueness_constraints: {
                      users_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                ],
                functions: [],
                procedures: [],
              },
              capabilities: {
                version: '0.1.1',
                capabilities: {
                  query: {
                    aggregates: {},
                    variables: {},
                    explain: {},
                    nested_fields: {},
                  },
                  mutation: {
                    transactional: {},
                    explain: {},
                  },
                  relationships: {
                    relation_comparisons: {},
                    order_by_aggregate: {},
                  },
                },
              },
            },
          },
        },
        {
          kind: 'DataConnectorLink',
          version: 'v1',
          definition: {
            name: 'sales_functions',
            url: {
              singleUrl: {
                value:
                  'https://service-2b2027e0-57cb-4632-9599-e27f842adfc9-xoa32wu4oa-uw.a.run.app',
              },
            },
            schema: {
              version: 'v0.1',
              schema: {
                scalar_types: {
                  Float: {
                    aggregate_functions: {},
                    comparison_operators: {},
                  },
                  String: {
                    aggregate_functions: {},
                    comparison_operators: {},
                  },
                },
                object_types: {},
                collections: [],
                functions: [
                  {
                    name: 'hello',
                    arguments: {
                      name: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                    },
                    result_type: {
                      type: 'named',
                      name: 'String',
                    },
                  },
                  {
                    name: 'toDateString',
                    description:
                      'Formats a date string to a human-readable format.',
                    arguments: {
                      date: {
                        description: 'The date string to format.',
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                    },
                    result_type: {
                      type: 'named',
                      name: 'String',
                    },
                  },
                  {
                    name: 'toCurrencyString',
                    description: 'Formats a number into a currency string.',
                    arguments: {
                      amount: {
                        description: 'The number to format into currency.',
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'Float',
                          },
                        },
                      },
                    },
                    result_type: {
                      type: 'named',
                      name: 'String',
                    },
                  },
                  {
                    name: 'get_github_profile_description',
                    description:
                      'Returns the github bio for the userid provided',
                    arguments: {
                      username: {
                        description:
                          "Username of the user who's bio will be fetched.",
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                    },
                    result_type: {
                      type: 'nullable',
                      underlying_type: {
                        type: 'named',
                        name: 'String',
                      },
                    },
                  },
                  {
                    name: 'get_github_profile_description_noparallel',
                    description:
                      'Returns the github bio for the userid provided',
                    arguments: {
                      username: {
                        description:
                          "Username of the user who's bio will be fetched.",
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                    },
                    result_type: {
                      type: 'nullable',
                      underlying_type: {
                        type: 'named',
                        name: 'String',
                      },
                    },
                  },
                ],
                procedures: [],
              },
              capabilities: {
                version: '0.1.0',
                capabilities: {
                  query: {
                    variables: {},
                    nested_fields: {},
                  },
                  mutation: {},
                },
              },
            },
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Sales_Int4ComparisonExp',
            },
            dataConnectorName: 'db3',
            dataConnectorScalarType: 'int4',
            representation: 'Int4',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Sales_TextComparisonExp',
            },
            dataConnectorName: 'db3',
            dataConnectorScalarType: 'text',
            representation: 'Text',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Sales_TimestamptzComparisonExp',
            },
            dataConnectorName: 'db3',
            dataConnectorScalarType: 'timestamptz',
            representation: 'Timestamptz',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Sales_UuidComparisonExp',
            },
            dataConnectorName: 'db3',
            dataConnectorScalarType: 'uuid',
            representation: 'Uuid',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Sales_BoolComparisonExp',
            },
            dataConnectorName: 'db3',
            dataConnectorScalarType: 'bool',
            representation: 'Bool',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Sales_StringComparisonExp',
            },
            dataConnectorName: 'sales_functions',
            dataConnectorScalarType: 'String',
            representation: 'String',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Sales_FloatComparisonExp',
            },
            dataConnectorName: 'sales_functions',
            dataConnectorScalarType: 'Float',
            representation: 'Float',
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Coupons',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'sales_couponsById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'sales_coupons',
              },
              orderByExpressionType: 'Sales_CouponsOrderBy',
            },
            objectType: 'Coupons',
            source: {
              dataConnectorName: 'db3',
              collection: 'coupons',
            },
            filterExpressionType: 'CouponsBoolExp',
            orderableFields: [
              {
                fieldName: 'amount',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'code',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'createdAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'expirationDate',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'percentOrValue',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Orders',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'sales_ordersById',
                  uniqueIdentifier: ['order_id'],
                },
              ],
              selectMany: {
                queryRootField: 'sales_orders',
              },
              orderByExpressionType: 'Sales_OrdersOrderBy',
            },
            objectType: 'Orders',
            globalIdSource: true,
            source: {
              dataConnectorName: 'db3',
              collection: 'orders',
            },
            filterExpressionType: 'OrdersBoolExp',
            orderableFields: [
              {
                fieldName: 'createdAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'deliveryDate',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'order_id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isReviewed',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'productId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'status',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'Coupons',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
              {
                role: 'customer',
                select: {
                  filter: {
                    and: [
                      {
                        fieldComparison: {
                          field: 'userId',
                          operator: '_eq',
                          value: {
                            sessionVariable: 'x-hasura-user-id',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
            modelName: 'Orders',
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'CouponsBoolExp',
            graphql: {
              typeName: 'Sales_CouponsBoolExp',
            },
            objectType: 'Coupons',
            dataConnectorName: 'db3',
            dataConnectorObjectType: 'coupons',
            comparableFields: [
              {
                fieldName: 'amount',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'code',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'createdAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'expirationDate',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'percentOrValue',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'OrdersBoolExp',
            graphql: {
              typeName: 'Sales_OrdersBoolExp',
            },
            objectType: 'Orders',
            dataConnectorName: 'db3',
            dataConnectorObjectType: 'orders',
            comparableFields: [
              {
                fieldName: 'createdAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'deliveryDate',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'order_id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isReviewed',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'productId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'status',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Coupons',
            fields: [
              {
                name: 'amount',
                type: 'Int4',
              },
              {
                name: 'code',
                type: 'Text!',
              },
              {
                name: 'createdAt',
                type: 'Timestamptz!',
              },
              {
                name: 'expirationDate',
                type: 'Timestamptz!',
              },
              {
                name: 'id',
                type: 'Uuid!',
              },
              {
                name: 'percentOrValue',
                type: 'Text',
                deprecated: {
                  reason: 'test1',
                },
              },
              {
                name: 'updatedAt',
                type: 'Timestamptz!',
              },
              {
                name: 'userId',
                type: 'Uuid!',
              },
            ],
            graphql: {
              typeName: 'Sales_Coupons',
              inputTypeName: 'Sales_CouponsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'db3',
                dataConnectorObjectType: 'coupons',
                fieldMapping: {
                  amount: {
                    column: {
                      name: 'amount',
                    },
                  },
                  code: {
                    column: {
                      name: 'code',
                    },
                  },
                  createdAt: {
                    column: {
                      name: 'created_at',
                    },
                  },
                  expirationDate: {
                    column: {
                      name: 'expiration_date',
                    },
                  },
                  id: {
                    column: {
                      name: 'id',
                    },
                  },
                  percentOrValue: {
                    column: {
                      name: 'percent_or_value',
                    },
                  },
                  updatedAt: {
                    column: {
                      name: 'updated_at',
                    },
                  },
                  userId: {
                    column: {
                      name: 'user_id',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Orders',
            fields: [
              {
                name: 'createdAt',
                type: 'Timestamptz!',
              },
              {
                name: 'deliveryDate',
                type: 'Timestamptz',
              },
              {
                name: 'order_id',
                type: 'Uuid!',
              },
              {
                name: 'isReviewed',
                type: 'Bool!',
              },
              {
                name: 'productId',
                type: 'Uuid!',
              },
              {
                name: 'status',
                type: 'Text!',
              },
              {
                name: 'updatedAt',
                type: 'Timestamptz!',
              },
              {
                name: 'userId',
                type: 'Uuid!',
              },
            ],
            globalIdFields: ['order_id'],
            graphql: {
              typeName: 'Sales_Orders',
              inputTypeName: 'Sales_OrdersInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'db3',
                dataConnectorObjectType: 'orders',
                fieldMapping: {
                  createdAt: {
                    column: {
                      name: 'created_at',
                    },
                  },
                  deliveryDate: {
                    column: {
                      name: 'delivery_date',
                    },
                  },
                  isReviewed: {
                    column: {
                      name: 'is_reviewed',
                    },
                  },
                  order_id: {
                    column: {
                      name: 'id',
                    },
                  },
                  productId: {
                    column: {
                      name: 'product_id',
                    },
                  },
                  status: {
                    column: {
                      name: 'status',
                    },
                  },
                  updatedAt: {
                    column: {
                      name: 'updated_at',
                    },
                  },
                  userId: {
                    column: {
                      name: 'user_id',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'users',
            sourceType: 'Coupons',
            target: {
              model: {
                name: 'Users',
                subgraph: 'users',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'formatCurrency',
            sourceType: 'Coupons',
            target: {
              command: {
                name: 'ToCurrencyString',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'amount',
                    },
                  ],
                },
                target: {
                  argument: {
                    argumentName: 'amount',
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'users',
            sourceType: 'Orders',
            target: {
              model: {
                name: 'Users',
                subgraph: 'users',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'products',
            sourceType: 'Orders',
            target: {
              model: {
                name: 'Products',
                subgraph: 'experience',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'formattedCreatedAt',
            sourceType: 'Orders',
            target: {
              command: {
                name: 'ToDateString',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'createdAt',
                    },
                  ],
                },
                target: {
                  argument: {
                    argumentName: 'date',
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'formattedDeliveryDate',
            sourceType: 'Orders',
            target: {
              command: {
                name: 'ToDateString',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'deliveryDate',
                    },
                  ],
                },
                target: {
                  argument: {
                    argumentName: 'date',
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Int4',
            graphql: {
              typeName: 'Sales_Int4',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Text',
            graphql: {
              typeName: 'Sales_Text',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Timestamptz',
            graphql: {
              typeName: 'Sales_Timestamptz',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Uuid',
            graphql: {
              typeName: 'Sales_Uuid',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Bool',
            graphql: {
              typeName: 'Sales_Bool',
            },
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Coupons',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'amount',
                    'code',
                    'createdAt',
                    'expirationDate',
                    'id',
                    'percentOrValue',
                    'updatedAt',
                    'userId',
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Orders',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'createdAt',
                    'deliveryDate',
                    'order_id',
                    'isReviewed',
                    'productId',
                    'status',
                    'updatedAt',
                    'userId',
                  ],
                },
              },
              {
                role: 'customer',
                output: {
                  allowedFields: [
                    'createdAt',
                    'deliveryDate',
                    'order_id',
                    'isReviewed',
                    'productId',
                    'status',
                    'userId',
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    {
      name: 'users',
      objects: [
        {
          kind: 'DataConnectorLink',
          version: 'v1',
          definition: {
            name: 'repeated_database_name',
            url: {
              singleUrl: {
                value:
                  'http://c2-u45lxvt0v7.gcp.postgres.ndc.internal/deployment/a693ec63-5087-4f66-9792-cca42196e551',
              },
            },
            schema: {
              version: 'v0.1',
              schema: {
                scalar_types: {
                  bool: {
                    aggregate_functions: {
                      bool_and: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      bool_or: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      every: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                    },
                  },
                  int4: {
                    aggregate_functions: {
                      bit_and: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      bit_or: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      bit_xor: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                    },
                  },
                  text: {
                    aggregate_functions: {
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _ilike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _iregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _like: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nilike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _niregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nlike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _regex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      starts_with: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      ts_match_tt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  timestamptz: {
                    aggregate_functions: {
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                  },
                  uuid: {
                    aggregate_functions: {},
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  vector: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                    },
                  },
                },
                object_types: {
                  cart_items: {
                    fields: {
                      cart_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      quantity: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                    },
                  },
                  carts: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_complete: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      is_reminder_sent: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  categories: {
                    fields: {
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  coupons: {
                    fields: {
                      amount: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'int4',
                          },
                        },
                      },
                      code: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      expiration_date: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      percent_or_value: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'text',
                          },
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  manufacturers: {
                    fields: {
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  notifications: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      message: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  orders: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      delivery_date: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_reviewed: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      status: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  products: {
                    fields: {
                      category_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      country_of_origin: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      description: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      image: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      manufacturer_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      price: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      vector: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'vector',
                          },
                        },
                      },
                    },
                  },
                  reviews: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_visible: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      rating: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      text: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  users: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      email: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      favorite_artist: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'int4',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_email_verified: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'bool',
                          },
                        },
                      },
                      last_seen: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      password: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'text',
                          },
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                  },
                },
                collections: [
                  {
                    name: 'cart_items',
                    arguments: {},
                    type: 'cart_items',
                    uniqueness_constraints: {
                      cart_items_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      cart_items_cart_id_foreign: {
                        column_mapping: {
                          cart_id: 'id',
                        },
                        foreign_collection: 'carts',
                      },
                      cart_items_product_id_foreign: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                    },
                  },
                  {
                    name: 'carts',
                    arguments: {},
                    type: 'carts',
                    uniqueness_constraints: {
                      carts_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      carts_user_id_foreign: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'categories',
                    arguments: {},
                    type: 'categories',
                    uniqueness_constraints: {
                      categories_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'coupons',
                    arguments: {},
                    type: 'coupons',
                    uniqueness_constraints: {
                      coupons_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      coupons_user_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'manufacturers',
                    arguments: {},
                    type: 'manufacturers',
                    uniqueness_constraints: {
                      manufacturers_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'notifications',
                    arguments: {},
                    type: 'notifications',
                    uniqueness_constraints: {
                      notifications_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      notifications_user_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'orders',
                    arguments: {},
                    type: 'orders',
                    uniqueness_constraints: {
                      orders_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      orders_customer_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                      orders_product_id_fkey: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                    },
                  },
                  {
                    name: 'products',
                    arguments: {},
                    type: 'products',
                    uniqueness_constraints: {
                      products_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      products_category_foreign: {
                        column_mapping: {
                          category_id: 'id',
                        },
                        foreign_collection: 'categories',
                      },
                      products_manufacturer_foreign: {
                        column_mapping: {
                          manufacturer_id: 'id',
                        },
                        foreign_collection: 'manufacturers',
                      },
                    },
                  },
                  {
                    name: 'reviews',
                    arguments: {},
                    type: 'reviews',
                    uniqueness_constraints: {
                      reviews_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      reviews_product_id_foreign: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                      reviews_user_id_foreign: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'users',
                    arguments: {},
                    type: 'users',
                    uniqueness_constraints: {
                      users_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                ],
                functions: [],
                procedures: [],
              },
              capabilities: {
                version: '0.1.1',
                capabilities: {
                  query: {
                    aggregates: {},
                    variables: {},
                    explain: {},
                    nested_fields: {},
                  },
                  mutation: {
                    transactional: {},
                    explain: {},
                  },
                  relationships: {
                    relation_comparisons: {},
                    order_by_aggregate: {},
                  },
                },
              },
            },
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Users_TimestamptzComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'timestamptz',
            representation: 'Timestamptz',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Users_TextComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'text',
            representation: 'Text',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Users_Int4ComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'int4',
            representation: 'Int4',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Users_UuidComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'uuid',
            representation: 'Uuid',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Users_BoolComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'bool',
            representation: 'Bool',
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Notifications',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'users_notificationsById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'users_notifications',
              },
              orderByExpressionType: 'Users_NotificationsOrderBy',
            },
            objectType: 'Notifications',
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'notifications',
            },
            filterExpressionType: 'NotificationsBoolExp',
            orderableFields: [
              {
                fieldName: 'createdAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'message',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Reviews',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'users_reviewsById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'users_reviews',
              },
              orderByExpressionType: 'Users_ReviewsOrderBy',
            },
            objectType: 'Reviews',
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'reviews',
            },
            filterExpressionType: 'ReviewsBoolExp',
            orderableFields: [
              {
                fieldName: 'createdAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isVisible',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'productId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'rating',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'text',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Users',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'users_usersById',
                  uniqueIdentifier: ['user_id'],
                },
              ],
              selectMany: {
                queryRootField: 'users_users',
              },
              orderByExpressionType: 'Users_UsersOrderBy',
            },
            objectType: 'Users',
            globalIdSource: true,
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'users',
            },
            filterExpressionType: 'UsersBoolExp',
            orderableFields: [
              {
                fieldName: 'createdAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'email',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'favoriteArtist',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'user_id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isEmailVerified',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'lastSeen',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'name',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'password',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'Notifications',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'Reviews',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'Users',
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'NotificationsBoolExp',
            graphql: {
              typeName: 'Users_NotificationsBoolExp',
            },
            objectType: 'Notifications',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'notifications',
            comparableFields: [
              {
                fieldName: 'createdAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'message',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'ReviewsBoolExp',
            graphql: {
              typeName: 'Users_ReviewsBoolExp',
            },
            objectType: 'Reviews',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'reviews',
            comparableFields: [
              {
                fieldName: 'createdAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isVisible',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'productId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'rating',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'text',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'UsersBoolExp',
            graphql: {
              typeName: 'Users_UsersBoolExp',
            },
            objectType: 'Users',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'users',
            comparableFields: [
              {
                fieldName: 'createdAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'email',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'favoriteArtist',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'user_id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isEmailVerified',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'lastSeen',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'name',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'password',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Notifications',
            fields: [
              {
                name: 'createdAt',
                type: 'Timestamptz!',
              },
              {
                name: 'id',
                type: 'Uuid!',
              },
              {
                name: 'message',
                type: 'Text!',
              },
              {
                name: 'updatedAt',
                type: 'Timestamptz!',
              },
              {
                name: 'userId',
                type: 'Uuid!',
              },
            ],
            graphql: {
              typeName: 'Users_Notifications',
              inputTypeName: 'Users_NotificationsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'notifications',
                fieldMapping: {
                  createdAt: {
                    column: {
                      name: 'created_at',
                    },
                  },
                  id: {
                    column: {
                      name: 'id',
                    },
                  },
                  message: {
                    column: {
                      name: 'message',
                    },
                  },
                  updatedAt: {
                    column: {
                      name: 'updated_at',
                    },
                  },
                  userId: {
                    column: {
                      name: 'user_id',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Reviews',
            fields: [
              {
                name: 'createdAt',
                type: 'Timestamptz!',
              },
              {
                name: 'id',
                type: 'Uuid!',
              },
              {
                name: 'isVisible',
                type: 'Bool!',
              },
              {
                name: 'productId',
                type: 'Uuid!',
              },
              {
                name: 'rating',
                type: 'Int4!',
              },
              {
                name: 'text',
                type: 'Text!',
              },
              {
                name: 'updatedAt',
                type: 'Timestamptz!',
              },
              {
                name: 'userId',
                type: 'Uuid!',
              },
            ],
            graphql: {
              typeName: 'Users_Reviews',
              inputTypeName: 'Users_ReviewsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'reviews',
                fieldMapping: {
                  createdAt: {
                    column: {
                      name: 'created_at',
                    },
                  },
                  id: {
                    column: {
                      name: 'id',
                    },
                  },
                  isVisible: {
                    column: {
                      name: 'is_visible',
                    },
                  },
                  productId: {
                    column: {
                      name: 'product_id',
                    },
                  },
                  rating: {
                    column: {
                      name: 'rating',
                    },
                  },
                  text: {
                    column: {
                      name: 'text',
                    },
                  },
                  updatedAt: {
                    column: {
                      name: 'updated_at',
                    },
                  },
                  userId: {
                    column: {
                      name: 'user_id',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Users',
            fields: [
              {
                name: 'createdAt',
                type: 'Timestamptz!',
              },
              {
                name: 'email',
                type: 'Text!',
              },
              {
                name: 'favoriteArtist',
                type: 'Int4',
              },
              {
                name: 'user_id',
                type: 'Uuid!',
              },
              {
                name: 'isEmailVerified',
                type: 'Bool',
              },
              {
                name: 'lastSeen',
                type: 'Timestamptz',
              },
              {
                name: 'name',
                type: 'Text!',
              },
              {
                name: 'password',
                type: 'Text',
              },
              {
                name: 'updatedAt',
                type: 'Timestamptz!',
              },
            ],
            globalIdFields: ['user_id'],
            graphql: {
              typeName: 'Users_Users',
              inputTypeName: 'Users_UsersInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'users',
                fieldMapping: {
                  createdAt: {
                    column: {
                      name: 'created_at',
                    },
                  },
                  email: {
                    column: {
                      name: 'email',
                    },
                  },
                  favoriteArtist: {
                    column: {
                      name: 'favorite_artist',
                    },
                  },
                  isEmailVerified: {
                    column: {
                      name: 'is_email_verified',
                    },
                  },
                  lastSeen: {
                    column: {
                      name: 'last_seen',
                    },
                  },
                  name: {
                    column: {
                      name: 'name',
                    },
                  },
                  password: {
                    column: {
                      name: 'password',
                    },
                  },
                  updatedAt: {
                    column: {
                      name: 'updated_at',
                    },
                  },
                  user_id: {
                    column: {
                      name: 'id',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'users',
            sourceType: 'Notifications',
            target: {
              model: {
                name: 'Users',
                subgraph: 'users',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'products',
            sourceType: 'Reviews',
            target: {
              model: {
                name: 'Products',
                subgraph: 'experience',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'users',
            sourceType: 'Reviews',
            target: {
              model: {
                name: 'Users',
                subgraph: 'users',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'carts',
            sourceType: 'Users',
            target: {
              model: {
                name: 'Carts',
                subgraph: 'experience',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'coupons',
            sourceType: 'Users',
            target: {
              model: {
                name: 'Coupons',
                subgraph: 'sales',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'notifications',
            sourceType: 'Users',
            target: {
              model: {
                name: 'Notifications',
                subgraph: 'users',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'orders',
            sourceType: 'Users',
            target: {
              model: {
                name: 'Orders',
                subgraph: 'sales',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'reviews',
            sourceType: 'Users',
            target: {
              model: {
                name: 'Reviews',
                subgraph: 'users',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'recentlyViewedProducts',
            sourceType: 'Users',
            target: {
              model: {
                name: 'RecentlyViewedProducts',
                subgraph: 'analytics',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'SessionHistory',
            sourceType: 'Users',
            target: {
              model: {
                name: 'SessionHistory',
                subgraph: 'analytics',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'githubprofile',
            sourceType: 'Users',
            target: {
              command: {
                name: 'GetGithubProfileDescription',
                subgraph: 'sales',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'name',
                    },
                  ],
                },
                target: {
                  argument: {
                    argumentName: 'username',
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'githubprofilenoparallel',
            sourceType: 'Users',
            target: {
              command: {
                name: 'GetGithubProfileDescriptionNoparallel',
                subgraph: 'sales',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'name',
                    },
                  ],
                },
                target: {
                  argument: {
                    argumentName: 'username',
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Timestamptz',
            graphql: {
              typeName: 'Users_Timestamptz',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Text',
            graphql: {
              typeName: 'Users_Text',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Int4',
            graphql: {
              typeName: 'Users_Int4',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Uuid',
            graphql: {
              typeName: 'Users_Uuid',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Bool',
            graphql: {
              typeName: 'Users_Bool',
            },
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Notifications',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'createdAt',
                    'id',
                    'message',
                    'updatedAt',
                    'userId',
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Reviews',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'createdAt',
                    'id',
                    'isVisible',
                    'productId',
                    'rating',
                    'text',
                    'updatedAt',
                    'userId',
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Users',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'createdAt',
                    'email',
                    'favoriteArtist',
                    'user_id',
                    'isEmailVerified',
                    'lastSeen',
                    'name',
                    'password',
                    'updatedAt',
                  ],
                },
              },
              {
                role: 'customer',
                output: {
                  allowedFields: [
                    'createdAt',
                    'email',
                    'favoriteArtist',
                    'user_id',
                    'isEmailVerified',
                    'name',
                    'password',
                    'updatedAt',
                  ],
                },
              },
              {
                role: 'guest',
                output: {
                  allowedFields: ['name'],
                },
              },
            ],
          },
        },
      ],
    },
    {
      name: 'analytics',
      objects: [
        {
          kind: 'DataConnectorLink',
          version: 'v1',
          definition: {
            name: 'clickhouse',
            url: {
              singleUrl: {
                value:
                  'https://service-861fe044-dd5a-4576-843b-94e9462e3a3d-xoa32wu4oa-ue.a.run.app',
              },
            },
            schema: {
              version: 'v0.1',
              schema: {
                scalar_types: {
                  DateTime: {
                    aggregate_functions: {
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                      _nin: {
                        type: 'custom',
                        argument_type: {
                          type: 'array',
                          element_type: {
                            type: 'named',
                            name: 'DateTime',
                          },
                        },
                      },
                    },
                  },
                  Int32: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'Float64',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'Int32',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'Int32',
                        },
                      },
                      stddev_pop: {
                        result_type: {
                          type: 'named',
                          name: 'Float64',
                        },
                      },
                      stddev_samp: {
                        result_type: {
                          type: 'named',
                          name: 'Float64',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'Int64',
                        },
                      },
                      var_pop: {
                        result_type: {
                          type: 'named',
                          name: 'Float64',
                        },
                      },
                      var_samp: {
                        result_type: {
                          type: 'named',
                          name: 'Float64',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int32',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int32',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int32',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int32',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int32',
                        },
                      },
                      _nin: {
                        type: 'custom',
                        argument_type: {
                          type: 'array',
                          element_type: {
                            type: 'named',
                            name: 'Int32',
                          },
                        },
                      },
                    },
                  },
                  String: {
                    aggregate_functions: {},
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _ilike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _like: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _match: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _nilike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _nin: {
                        type: 'custom',
                        argument_type: {
                          type: 'array',
                          element_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      _nlike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                    },
                  },
                },
                object_types: {
                  browsing_history: {
                    description: '',
                    fields: {
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      viewed_at: {
                        type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                    },
                  },
                  recently_viewed_products: {
                    fields: {
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      viewed: {
                        type: {
                          type: 'named',
                          name: 'Int32',
                        },
                      },
                      viewed_at: {
                        type: {
                          type: 'array',
                          element_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                    },
                  },
                  session_history: {
                    description: '',
                    fields: {
                      logged_in_at: {
                        type: {
                          type: 'named',
                          name: 'DateTime',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                    },
                  },
                },
                collections: [
                  {
                    name: 'browsing_history',
                    description: '',
                    arguments: {},
                    type: 'browsing_history',
                    uniqueness_constraints: {
                      user_id: {
                        unique_columns: ['user_id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'session_history',
                    description: '',
                    arguments: {},
                    type: 'session_history',
                    uniqueness_constraints: {
                      user_id: {
                        unique_columns: ['user_id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'recently_viewed_products',
                    arguments: {},
                    type: 'recently_viewed_products',
                    uniqueness_constraints: {},
                    foreign_keys: {},
                  },
                ],
                functions: [],
                procedures: [],
              },
              capabilities: {
                version: '^0.1.1',
                capabilities: {
                  query: {
                    aggregates: {},
                    variables: {},
                    explain: {},
                    nested_fields: {},
                  },
                  mutation: {},
                  relationships: {
                    relation_comparisons: {},
                    order_by_aggregate: {},
                  },
                },
              },
            },
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Analytics_StringComparisonExp',
            },
            dataConnectorName: 'clickhouse',
            dataConnectorScalarType: 'String',
            representation: 'String',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Analytics_DateTimeComparisonExp',
            },
            dataConnectorName: 'clickhouse',
            dataConnectorScalarType: 'DateTime',
            representation: 'DateTime',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Analytics_Int32ComparisonExp',
            },
            dataConnectorName: 'clickhouse',
            dataConnectorScalarType: 'Int32',
            representation: 'Int32',
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'BrowsingHistory',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'analytics_browsingHistoryByUserId',
                  uniqueIdentifier: ['userId'],
                },
              ],
              selectMany: {
                queryRootField: 'analytics_browsingHistory',
              },
              orderByExpressionType: 'Analytics_BrowsingHistoryOrderBy',
            },
            objectType: 'BrowsingHistory',
            source: {
              dataConnectorName: 'clickhouse',
              collection: 'browsing_history',
            },
            filterExpressionType: 'BrowsingHistoryBoolExp',
            orderableFields: [
              {
                fieldName: 'productId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'viewedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'RecentlyViewedProducts',
            graphql: {
              selectUniques: [],
              selectMany: {
                queryRootField: 'analytics_recentlyViewedProducts',
              },
              orderByExpressionType: 'analytics_recentlyViewedProductsOrderBy',
            },
            objectType: 'RecentlyViewedProducts',
            source: {
              dataConnectorName: 'clickhouse',
              collection: 'recently_viewed_products',
            },
            filterExpressionType: 'RecentlyViewedProductsBoolExp',
            orderableFields: [
              {
                fieldName: 'productId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'viewed',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'viewedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'SessionHistory',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'analytics_sessionHistoryByUserId',
                  uniqueIdentifier: ['userId'],
                },
              ],
              selectMany: {
                queryRootField: 'analytics_sessionHistory',
              },
              orderByExpressionType: 'Analytics_SessionHistoryOrderBy',
            },
            objectType: 'SessionHistory',
            source: {
              dataConnectorName: 'clickhouse',
              collection: 'session_history',
            },
            filterExpressionType: 'SessionHistoryBoolExp',
            orderableFields: [
              {
                fieldName: 'loggedInAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'BrowsingHistory',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'RecentlyViewedProducts',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'SessionHistory',
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'BrowsingHistoryBoolExp',
            graphql: {
              typeName: 'Analytics_BrowsingHistoryBoolExp',
            },
            objectType: 'BrowsingHistory',
            dataConnectorName: 'clickhouse',
            dataConnectorObjectType: 'browsing_history',
            comparableFields: [
              {
                fieldName: 'productId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'viewedAt',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'RecentlyViewedProductsBoolExp',
            graphql: {
              typeName: 'analytics_recentlyViewedProductsBoolExp',
            },
            objectType: 'RecentlyViewedProducts',
            dataConnectorName: 'clickhouse',
            dataConnectorObjectType: 'recently_viewed_products',
            comparableFields: [
              {
                fieldName: 'productId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'viewed',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'viewedAt',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'SessionHistoryBoolExp',
            graphql: {
              typeName: 'Analytics_SessionHistoryBoolExp',
            },
            objectType: 'SessionHistory',
            dataConnectorName: 'clickhouse',
            dataConnectorObjectType: 'session_history',
            comparableFields: [
              {
                fieldName: 'loggedInAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'BrowsingHistory',
            fields: [
              {
                name: 'productId',
                type: 'String!',
              },
              {
                name: 'userId',
                type: 'String!',
              },
              {
                name: 'viewedAt',
                type: 'DateTime!',
              },
            ],
            graphql: {
              typeName: 'Analytics_BrowsingHistory',
              inputTypeName: 'Analytics_BrowsingHistoryInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'clickhouse',
                dataConnectorObjectType: 'browsing_history',
                fieldMapping: {
                  productId: {
                    column: {
                      name: 'product_id',
                    },
                  },
                  userId: {
                    column: {
                      name: 'user_id',
                    },
                  },
                  viewedAt: {
                    column: {
                      name: 'viewed_at',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'RecentlyViewedProducts',
            fields: [
              {
                name: 'productId',
                type: 'String!',
              },
              {
                name: 'userId',
                type: 'String!',
              },
              {
                name: 'viewed',
                type: 'Int32!',
              },
              {
                name: 'viewedAt',
                type: '[String!]!',
              },
            ],
            graphql: {
              typeName: 'analytics_recentlyViewedProducts',
              inputTypeName: 'analytics_recentlyViewedProductsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'clickhouse',
                dataConnectorObjectType: 'recently_viewed_products',
                fieldMapping: {
                  productId: {
                    column: {
                      name: 'product_id',
                    },
                  },
                  userId: {
                    column: {
                      name: 'user_id',
                    },
                  },
                  viewed: {
                    column: {
                      name: 'viewed',
                    },
                  },
                  viewedAt: {
                    column: {
                      name: 'viewed_at',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'SessionHistory',
            fields: [
              {
                name: 'loggedInAt',
                type: 'DateTime!',
              },
              {
                name: 'userId',
                type: 'String!',
              },
            ],
            graphql: {
              typeName: 'Analytics_SessionHistory',
              inputTypeName: 'Analytics_SessionHistoryInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'clickhouse',
                dataConnectorObjectType: 'session_history',
                fieldMapping: {
                  loggedInAt: {
                    column: {
                      name: 'logged_in_at',
                    },
                  },
                  userId: {
                    column: {
                      name: 'user_id',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'product',
            sourceType: 'RecentlyViewedProducts',
            target: {
              model: {
                name: 'Products',
                subgraph: 'experience',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'user',
            sourceType: 'RecentlyViewedProducts',
            target: {
              model: {
                name: 'Users',
                subgraph: 'users',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'user',
            sourceType: 'SessionHistory',
            target: {
              model: {
                name: 'Users',
                subgraph: 'users',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'DateTime',
            graphql: {
              typeName: 'Analytics_DateTime',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Int32',
            graphql: {
              typeName: 'Analytics_Int32',
            },
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'BrowsingHistory',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: ['productId', 'userId', 'viewedAt'],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'RecentlyViewedProducts',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: ['productId', 'userId', 'viewed', 'viewedAt'],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'SessionHistory',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: ['loggedInAt', 'userId'],
                },
              },
            ],
          },
        },
      ],
    },
    {
      name: 'experience',
      objects: [
        {
          kind: 'DataConnectorLink',
          version: 'v1',
          definition: {
            name: 'repeated_database_name',
            url: {
              singleUrl: {
                value:
                  'http://c2-u45lxvt0v7.gcp.postgres.ndc.internal/deployment/cff2625b-a602-43d5-b277-7a988a0fab56',
              },
            },
            schema: {
              version: 'v0.1',
              schema: {
                scalar_types: {
                  bool: {
                    aggregate_functions: {
                      bool_and: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      bool_or: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      every: {
                        result_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                    },
                  },
                  float8: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      stddev: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      stddev_pop: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      stddev_samp: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      var_pop: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      var_samp: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      variance: {
                        result_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'float8',
                        },
                      },
                    },
                  },
                  int4: {
                    aggregate_functions: {
                      bit_and: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      bit_or: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      bit_xor: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                    },
                  },
                  text: {
                    aggregate_functions: {
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _ilike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _iregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _like: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nilike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _niregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nlike: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _nregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      _regex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      starts_with: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      ts_match_tt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  timestamptz: {
                    aggregate_functions: {
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                  },
                  uuid: {
                    aggregate_functions: {},
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  vector: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _in: {
                        type: 'in',
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'vector',
                        },
                      },
                    },
                  },
                },
                object_types: {
                  cart_items: {
                    fields: {
                      cart_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      quantity: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                    },
                  },
                  carts: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_complete: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      is_reminder_sent: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  categories: {
                    fields: {
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  coupons: {
                    fields: {
                      amount: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'int4',
                          },
                        },
                      },
                      code: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      expiration_date: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      percent_or_value: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'text',
                          },
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  manufacturers: {
                    fields: {
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                    },
                  },
                  notifications: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      message: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  orders: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      delivery_date: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_reviewed: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      status: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  products: {
                    fields: {
                      category_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      country_of_origin: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      description: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      image: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      manufacturer_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      price: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      vector: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'vector',
                          },
                        },
                      },
                    },
                  },
                  products_vector_distance: {
                    fields: {
                      distance: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'float8',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'uuid',
                          },
                        },
                      },
                    },
                  },
                  reviews: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_visible: {
                        type: {
                          type: 'named',
                          name: 'bool',
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      rating: {
                        type: {
                          type: 'named',
                          name: 'int4',
                        },
                      },
                      text: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      user_id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                    },
                  },
                  users: {
                    fields: {
                      created_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                      email: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      favorite_artist: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'int4',
                          },
                        },
                      },
                      id: {
                        type: {
                          type: 'named',
                          name: 'uuid',
                        },
                      },
                      is_email_verified: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'bool',
                          },
                        },
                      },
                      last_seen: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'timestamptz',
                          },
                        },
                      },
                      name: {
                        type: {
                          type: 'named',
                          name: 'text',
                        },
                      },
                      password: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'text',
                          },
                        },
                      },
                      updated_at: {
                        type: {
                          type: 'named',
                          name: 'timestamptz',
                        },
                      },
                    },
                  },
                },
                collections: [
                  {
                    name: 'cart_items',
                    arguments: {},
                    type: 'cart_items',
                    uniqueness_constraints: {
                      cart_items_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      cart_items_cart_id_foreign: {
                        column_mapping: {
                          cart_id: 'id',
                        },
                        foreign_collection: 'carts',
                      },
                      cart_items_product_id_foreign: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                    },
                  },
                  {
                    name: 'carts',
                    arguments: {},
                    type: 'carts',
                    uniqueness_constraints: {
                      carts_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      carts_user_id_foreign: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'categories',
                    arguments: {},
                    type: 'categories',
                    uniqueness_constraints: {
                      categories_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'coupons',
                    arguments: {},
                    type: 'coupons',
                    uniqueness_constraints: {
                      coupons_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      coupons_user_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'manufacturers',
                    arguments: {},
                    type: 'manufacturers',
                    uniqueness_constraints: {
                      manufacturers_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'notifications',
                    arguments: {},
                    type: 'notifications',
                    uniqueness_constraints: {
                      notifications_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      notifications_user_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'orders',
                    arguments: {},
                    type: 'orders',
                    uniqueness_constraints: {
                      orders_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      orders_customer_id_fkey: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                      orders_product_id_fkey: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                    },
                  },
                  {
                    name: 'products',
                    arguments: {},
                    type: 'products',
                    uniqueness_constraints: {
                      products_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      products_category_foreign: {
                        column_mapping: {
                          category_id: 'id',
                        },
                        foreign_collection: 'categories',
                      },
                      products_manufacturer_foreign: {
                        column_mapping: {
                          manufacturer_id: 'id',
                        },
                        foreign_collection: 'manufacturers',
                      },
                    },
                  },
                  {
                    name: 'reviews',
                    arguments: {},
                    type: 'reviews',
                    uniqueness_constraints: {
                      reviews_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {
                      reviews_product_id_foreign: {
                        column_mapping: {
                          product_id: 'id',
                        },
                        foreign_collection: 'products',
                      },
                      reviews_user_id_foreign: {
                        column_mapping: {
                          user_id: 'id',
                        },
                        foreign_collection: 'users',
                      },
                    },
                  },
                  {
                    name: 'users',
                    arguments: {},
                    type: 'users',
                    uniqueness_constraints: {
                      users_pkey: {
                        unique_columns: ['id'],
                      },
                    },
                    foreign_keys: {},
                  },
                  {
                    name: 'products_vector_distance',
                    arguments: {
                      query_vector: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'vector',
                          },
                        },
                      },
                    },
                    type: 'products_vector_distance',
                    uniqueness_constraints: {},
                    foreign_keys: {},
                  },
                ],
                functions: [],
                procedures: [],
              },
              capabilities: {
                version: '0.1.1',
                capabilities: {
                  query: {
                    aggregates: {},
                    variables: {},
                    explain: {},
                    nested_fields: {},
                  },
                  mutation: {
                    transactional: {},
                    explain: {},
                  },
                  relationships: {
                    relation_comparisons: {},
                    order_by_aggregate: {},
                  },
                },
              },
            },
          },
        },
        {
          kind: 'DataConnectorLink',
          version: 'v1',
          definition: {
            name: 'mongo',
            url: {
              singleUrl: {
                value:
                  'https://service-6573f167-dfa7-4a07-a730-31bad742c8cc-xoa32wu4oa-uw.a.run.app',
              },
            },
            schema: {
              version: 'v0.1',
              schema: {
                scalar_types: {
                  BinData: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'BinData',
                        },
                      },
                    },
                  },
                  Boolean: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Boolean',
                        },
                      },
                    },
                  },
                  Date: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'Date',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'Date',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Date',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Date',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Date',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Date',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Date',
                        },
                      },
                    },
                  },
                  DbPointer: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'DbPointer',
                        },
                      },
                    },
                  },
                  Decimal: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Decimal',
                        },
                      },
                    },
                  },
                  ExtendedJSON: {
                    aggregate_functions: {},
                    comparison_operators: {},
                  },
                  Float: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Float',
                        },
                      },
                    },
                  },
                  Int: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                  },
                  Javascript: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {},
                  },
                  JavascriptWithScope: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {},
                  },
                  Long: {
                    aggregate_functions: {
                      avg: {
                        result_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                      sum: {
                        result_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Long',
                        },
                      },
                    },
                  },
                  MaxKey: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'MaxKey',
                        },
                      },
                    },
                  },
                  MinKey: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'MinKey',
                        },
                      },
                    },
                  },
                  Null: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Null',
                        },
                      },
                    },
                  },
                  ObjectId: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'ObjectId',
                        },
                      },
                    },
                  },
                  Regex: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {},
                  },
                  String: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _iregex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      _regex: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                    },
                  },
                  Symbol: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Symbol',
                        },
                      },
                    },
                  },
                  Timestamp: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                      max: {
                        result_type: {
                          type: 'named',
                          name: 'Timestamp',
                        },
                      },
                      min: {
                        result_type: {
                          type: 'named',
                          name: 'Timestamp',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _gt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Timestamp',
                        },
                      },
                      _gte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Timestamp',
                        },
                      },
                      _lt: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Timestamp',
                        },
                      },
                      _lte: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Timestamp',
                        },
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Timestamp',
                        },
                      },
                    },
                  },
                  Undefined: {
                    aggregate_functions: {
                      count: {
                        result_type: {
                          type: 'named',
                          name: 'Int',
                        },
                      },
                    },
                    comparison_operators: {
                      _eq: {
                        type: 'equal',
                      },
                      _neq: {
                        type: 'custom',
                        argument_type: {
                          type: 'named',
                          name: 'Undefined',
                        },
                      },
                    },
                  },
                },
                object_types: {
                  product_details: {
                    fields: {
                      _id: {
                        type: {
                          type: 'named',
                          name: 'ObjectId',
                        },
                      },
                      features: {
                        type: {
                          type: 'array',
                          element_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      product_id: {
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      specifications: {
                        type: {
                          type: 'named',
                          name: 'product_details_specifications',
                        },
                      },
                    },
                  },
                  product_details_specifications: {
                    fields: {
                      additional_specs: {
                        type: {
                          type: 'named',
                          name: 'product_details_specifications_additional_specs',
                        },
                      },
                      color_options: {
                        type: {
                          type: 'array',
                          element_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      material: {
                        type: {
                          type: 'named',
                          name: 'String',
                        },
                      },
                      size_options: {
                        type: {
                          type: 'array',
                          element_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                    },
                  },
                  product_details_specifications_additional_specs: {
                    fields: {
                      brim: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      build: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      care_instructions: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      closure: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      durability: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      fabric_weight: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      heat_resistance: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                      packaging: {
                        type: {
                          type: 'nullable',
                          underlying_type: {
                            type: 'named',
                            name: 'String',
                          },
                        },
                      },
                    },
                  },
                },
                collections: [
                  {
                    name: 'product_details',
                    arguments: {},
                    type: 'product_details',
                    uniqueness_constraints: {
                      product_details_id: {
                        unique_columns: ['_id'],
                      },
                    },
                    foreign_keys: {},
                  },
                ],
                functions: [],
                procedures: [],
              },
              capabilities: {
                version: '0.1.1',
                capabilities: {
                  query: {
                    aggregates: {},
                    variables: {},
                    explain: {},
                    nested_fields: {},
                  },
                  mutation: {},
                  relationships: {},
                },
              },
            },
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName:
                'Experience_TimestamptzComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'timestamptz',
            representation: 'Timestamptz',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Experience_UuidComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'uuid',
            representation: 'Uuid',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Experience_BoolComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'bool',
            representation: 'Bool',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Experience_Int4ComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'int4',
            representation: 'Int4',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Experience_TextComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'text',
            representation: 'Text',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Experience_VectorComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'vector',
            representation: 'Vector',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'Experience_Float8ComparisonExp',
            },
            dataConnectorName: 'repeated_database_name',
            dataConnectorScalarType: 'float8',
            representation: 'Float8',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'App_ObjectIdComparisonExp',
            },
            dataConnectorName: 'mongo',
            dataConnectorScalarType: 'ObjectId',
            representation: 'ObjectId',
          },
        },
        {
          kind: 'DataConnectorScalarRepresentation',
          version: 'v1',
          definition: {
            graphql: {
              comparisonExpressionTypeName: 'App_StringComparisonExp_1',
            },
            dataConnectorName: 'mongo',
            dataConnectorScalarType: 'String',
            representation: 'String',
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'CartItems',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'experience_cartItemsById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'experience_cartItems',
              },
              orderByExpressionType: 'Experience_CartItemsOrderBy',
            },
            objectType: 'CartItems',
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'cart_items',
            },
            filterExpressionType: 'CartItemsBoolExp',
            orderableFields: [
              {
                fieldName: 'cartId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'createdAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'productId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'quantity',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Carts',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'experience_cartsById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'experience_carts',
              },
              orderByExpressionType: 'Experience_CartsOrderBy',
            },
            objectType: 'Carts',
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'carts',
            },
            filterExpressionType: 'CartsBoolExp',
            orderableFields: [
              {
                fieldName: 'createdAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isComplete',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isReminderSent',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Categories',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'experience_categoriesById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'experience_categories',
              },
              orderByExpressionType: 'Experience_CategoriesOrderBy',
            },
            objectType: 'Categories',
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'categories',
            },
            filterExpressionType: 'CategoriesBoolExp',
            orderableFields: [
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'name',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Manufacturers',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'experience_manufacturersById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'experience_manufacturers',
              },
              orderByExpressionType: 'Experience_ManufacturersOrderBy',
            },
            objectType: 'Manufacturers',
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'manufacturers',
            },
            filterExpressionType: 'ManufacturersBoolExp',
            orderableFields: [
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'name',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'Products',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'experience_productsById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'experience_products',
              },
              orderByExpressionType: 'Experience_ProductsOrderBy',
            },
            objectType: 'Products',
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'products',
            },
            filterExpressionType: 'ProductsBoolExp',
            orderableFields: [
              {
                fieldName: 'categoryId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'countryOfOrigin',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'createdAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'description',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'image',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'manufacturerId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'name',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'price',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'vector',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'ProductsVectorDistance',
            graphql: {
              selectUniques: [],
              selectMany: {
                queryRootField: 'experience_productsVectorDistance',
              },
              argumentsInputType: 'Experience_ProductsVectorDistanceArguments',
              orderByExpressionType: 'Experience_ProductsVectorDistanceOrderBy',
            },
            objectType: 'ProductsVectorDistance',
            arguments: [
              {
                name: 'queryVector',
                type: 'Vector',
              },
            ],
            source: {
              dataConnectorName: 'repeated_database_name',
              collection: 'products_vector_distance',
              argumentMapping: {
                queryVector: 'query_vector',
              },
            },
            filterExpressionType: 'ProductsVectorDistanceBoolExp',
            orderableFields: [
              {
                fieldName: 'distance',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'Model',
          version: 'v1',
          definition: {
            name: 'ProductDetails',
            graphql: {
              selectUniques: [
                {
                  queryRootField: 'experience_productDetailsById',
                  uniqueIdentifier: ['id'],
                },
              ],
              selectMany: {
                queryRootField: 'experience_productDetails',
              },
              orderByExpressionType: 'experience_productDetailsOrderBy',
            },
            objectType: 'ProductDetails',
            source: {
              dataConnectorName: 'mongo',
              collection: 'product_details',
            },
            filterExpressionType: 'ProductDetailsBoolExp',
            orderableFields: [
              {
                fieldName: 'id',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'features',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'productId',
                orderByDirections: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'specifications',
                orderByDirections: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'CartItems',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'Carts',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'Categories',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'Manufacturers',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
              {
                role: 'customer',
                select: {
                  filter: null,
                },
              },
              {
                role: 'guest',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'Products',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
              {
                role: 'manufacturer',
                select: {
                  filter: {
                    relationship: {
                      name: 'product',
                      predicate: {
                        fieldComparison: {
                          field: 'manufacturerId',
                          operator: '_eq',
                          value: {
                            sessionVariable: 'x-hasura-manufacturer-id',
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
            modelName: 'ProductsVectorDistance',
          },
        },
        {
          kind: 'ModelPermissions',
          version: 'v1',
          definition: {
            permissions: [
              {
                role: 'admin',
                select: {
                  filter: null,
                },
              },
            ],
            modelName: 'ProductDetails',
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'CartItemsBoolExp',
            graphql: {
              typeName: 'Experience_CartItemsBoolExp',
            },
            objectType: 'CartItems',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'cart_items',
            comparableFields: [
              {
                fieldName: 'cartId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'createdAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'productId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'quantity',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'CartsBoolExp',
            graphql: {
              typeName: 'Experience_CartsBoolExp',
            },
            objectType: 'Carts',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'carts',
            comparableFields: [
              {
                fieldName: 'createdAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isComplete',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'isReminderSent',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'userId',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'CategoriesBoolExp',
            graphql: {
              typeName: 'Experience_CategoriesBoolExp',
            },
            objectType: 'Categories',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'categories',
            comparableFields: [
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'name',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'ManufacturersBoolExp',
            graphql: {
              typeName: 'Experience_ManufacturersBoolExp',
            },
            objectType: 'Manufacturers',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'manufacturers',
            comparableFields: [
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'name',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'ProductsBoolExp',
            graphql: {
              typeName: 'Experience_ProductsBoolExp',
            },
            objectType: 'Products',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'products',
            comparableFields: [
              {
                fieldName: 'categoryId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'countryOfOrigin',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'createdAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'description',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'image',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'manufacturerId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'name',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'price',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'updatedAt',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'vector',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'ProductsVectorDistanceBoolExp',
            graphql: {
              typeName: 'Experience_ProductsVectorDistanceBoolExp',
            },
            objectType: 'ProductsVectorDistance',
            dataConnectorName: 'repeated_database_name',
            dataConnectorObjectType: 'products_vector_distance',
            comparableFields: [
              {
                fieldName: 'distance',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectBooleanExpressionType',
          version: 'v1',
          definition: {
            name: 'ProductDetailsBoolExp',
            graphql: {
              typeName: 'experience_productDetailsBoolExp',
            },
            objectType: 'ProductDetails',
            dataConnectorName: 'mongo',
            dataConnectorObjectType: 'product_details',
            comparableFields: [
              {
                fieldName: 'id',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'features',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'productId',
                operators: {
                  enableAll: true,
                },
              },
              {
                fieldName: 'specifications',
                operators: {
                  enableAll: true,
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'CartItems',
            fields: [
              {
                name: 'cartId',
                type: 'Uuid!',
              },
              {
                name: 'createdAt',
                type: 'Timestamptz',
              },
              {
                name: 'id',
                type: 'Uuid!',
              },
              {
                name: 'productId',
                type: 'Uuid!',
              },
              {
                name: 'quantity',
                type: 'Int4!',
              },
              {
                name: 'updatedAt',
                type: 'Timestamptz',
              },
            ],
            graphql: {
              typeName: 'Experience_CartItems',
              inputTypeName: 'Experience_CartItemsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'cart_items',
                fieldMapping: {
                  cartId: {
                    column: {
                      name: 'cart_id',
                    },
                  },
                  createdAt: {
                    column: {
                      name: 'created_at',
                    },
                  },
                  id: {
                    column: {
                      name: 'id',
                    },
                  },
                  productId: {
                    column: {
                      name: 'product_id',
                    },
                  },
                  quantity: {
                    column: {
                      name: 'quantity',
                    },
                  },
                  updatedAt: {
                    column: {
                      name: 'updated_at',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Carts',
            fields: [
              {
                name: 'createdAt',
                type: 'Timestamptz',
              },
              {
                name: 'id',
                type: 'Uuid!',
              },
              {
                name: 'isComplete',
                type: 'Bool!',
              },
              {
                name: 'isReminderSent',
                type: 'Bool!',
              },
              {
                name: 'updatedAt',
                type: 'Timestamptz',
              },
              {
                name: 'userId',
                type: 'Uuid!',
              },
            ],
            graphql: {
              typeName: 'Experience_Carts',
              inputTypeName: 'Experience_CartsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'carts',
                fieldMapping: {
                  createdAt: {
                    column: {
                      name: 'created_at',
                    },
                  },
                  id: {
                    column: {
                      name: 'id',
                    },
                  },
                  isComplete: {
                    column: {
                      name: 'is_complete',
                    },
                  },
                  isReminderSent: {
                    column: {
                      name: 'is_reminder_sent',
                    },
                  },
                  updatedAt: {
                    column: {
                      name: 'updated_at',
                    },
                  },
                  userId: {
                    column: {
                      name: 'user_id',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Categories',
            fields: [
              {
                name: 'id',
                type: 'Uuid!',
              },
              {
                name: 'name',
                type: 'Text!',
              },
            ],
            graphql: {
              typeName: 'Experience_Categories',
              inputTypeName: 'Experience_CategoriesInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'categories',
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Manufacturers',
            fields: [
              {
                name: 'id',
                type: 'Uuid!',
              },
              {
                name: 'name',
                type: 'Text!',
              },
            ],
            graphql: {
              typeName: 'Experience_Manufacturers',
              inputTypeName: 'Experience_ManufacturersInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'manufacturers',
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'Products',
            fields: [
              {
                name: 'categoryId',
                type: 'Uuid!',
              },
              {
                name: 'countryOfOrigin',
                type: 'Text!',
              },
              {
                name: 'createdAt',
                type: 'Timestamptz!',
              },
              {
                name: 'description',
                type: 'Text!',
              },
              {
                name: 'id',
                type: 'Uuid!',
              },
              {
                name: 'image',
                type: 'Text!',
              },
              {
                name: 'manufacturerId',
                type: 'Uuid!',
              },
              {
                name: 'name',
                type: 'Text!',
              },
              {
                name: 'price',
                type: 'Int4!',
              },
              {
                name: 'updatedAt',
                type: 'Timestamptz!',
              },
              {
                name: 'vector',
                type: 'Vector',
              },
            ],
            graphql: {
              typeName: 'Experience_Products',
              inputTypeName: 'Experience_ProductsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'products',
                fieldMapping: {
                  categoryId: {
                    column: {
                      name: 'category_id',
                    },
                  },
                  countryOfOrigin: {
                    column: {
                      name: 'country_of_origin',
                    },
                  },
                  createdAt: {
                    column: {
                      name: 'created_at',
                    },
                  },
                  description: {
                    column: {
                      name: 'description',
                    },
                  },
                  id: {
                    column: {
                      name: 'id',
                    },
                  },
                  image: {
                    column: {
                      name: 'image',
                    },
                  },
                  manufacturerId: {
                    column: {
                      name: 'manufacturer_id',
                    },
                  },
                  name: {
                    column: {
                      name: 'name',
                    },
                  },
                  price: {
                    column: {
                      name: 'price',
                    },
                  },
                  updatedAt: {
                    column: {
                      name: 'updated_at',
                    },
                  },
                  vector: {
                    column: {
                      name: 'vector',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'ProductsVectorDistance',
            fields: [
              {
                name: 'distance',
                type: 'Float8',
              },
              {
                name: 'id',
                type: 'Uuid',
              },
            ],
            graphql: {
              typeName: 'Experience_ProductsVectorDistance',
              inputTypeName: 'Experience_ProductsVectorDistanceInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'repeated_database_name',
                dataConnectorObjectType: 'products_vector_distance',
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'ProductDetailsSpecificationsAdditionalSpecs',
            fields: [
              {
                name: 'brim',
                type: 'String',
              },
              {
                name: 'build',
                type: 'String',
              },
              {
                name: 'careInstructions',
                type: 'String',
              },
              {
                name: 'closure',
                type: 'String',
              },
              {
                name: 'durability',
                type: 'String',
              },
              {
                name: 'fabricWeight',
                type: 'String',
              },
              {
                name: 'heatResistance',
                type: 'String',
              },
              {
                name: 'packaging',
                type: 'String',
              },
            ],
            graphql: {
              typeName:
                'experience_productDetailsSpecificationsAdditionalSpecs',
              inputTypeName:
                'experience_productDetailsSpecificationsAdditionalSpecsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'mongo',
                dataConnectorObjectType:
                  'product_details_specifications_additional_specs',
                fieldMapping: {
                  brim: {
                    column: {
                      name: 'brim',
                    },
                  },
                  build: {
                    column: {
                      name: 'build',
                    },
                  },
                  careInstructions: {
                    column: {
                      name: 'care_instructions',
                    },
                  },
                  closure: {
                    column: {
                      name: 'closure',
                    },
                  },
                  durability: {
                    column: {
                      name: 'durability',
                    },
                  },
                  fabricWeight: {
                    column: {
                      name: 'fabric_weight',
                    },
                  },
                  heatResistance: {
                    column: {
                      name: 'heat_resistance',
                    },
                  },
                  packaging: {
                    column: {
                      name: 'packaging',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'ProductDetailsSpecifications',
            fields: [
              {
                name: 'additionalSpecs',
                type: 'ProductDetailsSpecificationsAdditionalSpecs!',
              },
              {
                name: 'colorOptions',
                type: '[String!]!',
              },
              {
                name: 'material',
                type: 'String!',
              },
              {
                name: 'sizeOptions',
                type: '[String!]!',
              },
            ],
            graphql: {
              typeName: 'experience_productDetailsSpecifications',
              inputTypeName: 'experience_productDetailsSpecificationsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'mongo',
                dataConnectorObjectType: 'product_details_specifications',
                fieldMapping: {
                  additionalSpecs: {
                    column: {
                      name: 'additional_specs',
                    },
                  },
                  colorOptions: {
                    column: {
                      name: 'color_options',
                    },
                  },
                  material: {
                    column: {
                      name: 'material',
                    },
                  },
                  sizeOptions: {
                    column: {
                      name: 'size_options',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ObjectType',
          version: 'v1',
          definition: {
            name: 'ProductDetails',
            fields: [
              {
                name: 'id',
                type: 'ObjectId!',
              },
              {
                name: 'features',
                type: '[String!]!',
              },
              {
                name: 'productId',
                type: 'String!',
              },
              {
                name: 'specifications',
                type: 'ProductDetailsSpecifications!',
              },
            ],
            graphql: {
              typeName: 'experience_productDetails',
              inputTypeName: 'experience_productDetailsInput',
            },
            dataConnectorTypeMapping: [
              {
                dataConnectorName: 'mongo',
                dataConnectorObjectType: 'product_details',
                fieldMapping: {
                  features: {
                    column: {
                      name: 'features',
                    },
                  },
                  id: {
                    column: {
                      name: '_id',
                    },
                  },
                  productId: {
                    column: {
                      name: 'product_id',
                    },
                  },
                  specifications: {
                    column: {
                      name: 'specifications',
                    },
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'carts',
            sourceType: 'CartItems',
            target: {
              model: {
                name: 'Carts',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'cartId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'products',
            sourceType: 'CartItems',
            target: {
              model: {
                name: 'Products',
                subgraph: 'experience',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'cartItems',
            sourceType: 'Carts',
            target: {
              model: {
                name: 'CartItems',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'cartId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'users',
            sourceType: 'Carts',
            target: {
              model: {
                name: 'Users',
                subgraph: 'users',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'userId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'user_id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'products',
            sourceType: 'Categories',
            target: {
              model: {
                name: 'Products',
                subgraph: 'experience',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'categoryId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'products',
            sourceType: 'Manufacturers',
            target: {
              model: {
                name: 'Products',
                subgraph: 'experience',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'manufacturerId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'cartItems',
            sourceType: 'Products',
            target: {
              model: {
                name: 'CartItems',
                subgraph: 'experience',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'orders',
            sourceType: 'Products',
            target: {
              model: {
                name: 'Orders',
                subgraph: 'sales',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'categories',
            sourceType: 'Products',
            target: {
              model: {
                name: 'Categories',
                subgraph: 'experience',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'categoryId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'manufacturers',
            sourceType: 'Products',
            target: {
              model: {
                name: 'Manufacturers',
                subgraph: 'experience',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'manufacturerId',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'reviews',
            sourceType: 'Products',
            target: {
              model: {
                name: 'Reviews',
                subgraph: 'users',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'product',
            sourceType: 'ProductsVectorDistance',
            target: {
              model: {
                name: 'Products',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'productDetails',
            sourceType: 'Products',
            target: {
              model: {
                name: 'ProductDetails',
                relationshipType: 'Object',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'recentlyViewedProducts',
            sourceType: 'Products',
            target: {
              model: {
                name: 'RecentlyViewedProducts',
                subgraph: 'analytics',
                relationshipType: 'Array',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'id',
                    },
                  ],
                },
                target: {
                  modelField: [
                    {
                      fieldName: 'productId',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'Relationship',
          version: 'v1',
          definition: {
            name: 'formatCurrency',
            sourceType: 'Products',
            target: {
              command: {
                name: 'ToCurrencyString',
                subgraph: 'sales',
              },
            },
            mapping: [
              {
                source: {
                  fieldPath: [
                    {
                      fieldName: 'price',
                    },
                  ],
                },
                target: {
                  argument: {
                    argumentName: 'amount',
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Timestamptz',
            graphql: {
              typeName: 'Experience_Timestamptz',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Uuid',
            graphql: {
              typeName: 'Experience_Uuid',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Bool',
            graphql: {
              typeName: 'Experience_Bool',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Int4',
            graphql: {
              typeName: 'Experience_Int4',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Text',
            graphql: {
              typeName: 'Experience_Text',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Vector',
            graphql: {
              typeName: 'Experience_Vector',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'Float8',
            graphql: {
              typeName: 'Experience_Float8',
            },
          },
        },
        {
          kind: 'ScalarType',
          version: 'v1',
          definition: {
            name: 'ObjectId',
            graphql: {
              typeName: 'App_ObjectId',
            },
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'CartItems',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'cartId',
                    'createdAt',
                    'id',
                    'productId',
                    'quantity',
                    'updatedAt',
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Carts',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'createdAt',
                    'id',
                    'isComplete',
                    'isReminderSent',
                    'updatedAt',
                    'userId',
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Categories',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: ['id', 'name'],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Manufacturers',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: ['id', 'name'],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'Products',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'categoryId',
                    'countryOfOrigin',
                    'createdAt',
                    'description',
                    'id',
                    'image',
                    'manufacturerId',
                    'name',
                    'price',
                    'updatedAt',
                    'vector',
                  ],
                },
              },
              {
                role: 'customer',
                output: {
                  allowedFields: [
                    'categoryId',
                    'countryOfOrigin',
                    'createdAt',
                    'description',
                    'id',
                    'image',
                    'manufacturerId',
                    'name',
                    'price',
                    'updatedAt',
                  ],
                },
              },
              {
                role: 'guest',
                output: {
                  allowedFields: [
                    'categoryId',
                    'countryOfOrigin',
                    'description',
                    'id',
                    'image',
                    'manufacturerId',
                    'name',
                    'price',
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'ProductsVectorDistance',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: ['distance', 'id'],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'ProductDetailsSpecificationsAdditionalSpecs',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'brim',
                    'build',
                    'careInstructions',
                    'closure',
                    'durability',
                    'fabricWeight',
                    'heatResistance',
                    'packaging',
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'ProductDetailsSpecifications',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'additionalSpecs',
                    'colorOptions',
                    'material',
                    'sizeOptions',
                  ],
                },
              },
            ],
          },
        },
        {
          kind: 'TypePermissions',
          version: 'v1',
          definition: {
            typeName: 'ProductDetails',
            permissions: [
              {
                role: 'admin',
                output: {
                  allowedFields: [
                    'id',
                    'features',
                    'productId',
                    'specifications',
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  ],
};
