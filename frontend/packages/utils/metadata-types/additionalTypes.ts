import {
  OpenDdSubgraphObject as OpenDdsObject,
  RelationshipV1,
  V1_Subgraph,
  V1_SubgraphObject,
  V1_Supergraph,
  V1_SupergraphObject,
  V2_Subgraph,
  V2_SubgraphObject,
} from './generatedMetadataTypes';

export type Supergraph = V1_Supergraph | V2_Subgraph;
export type SupergraphObject = V1_SupergraphObject;

export type Subgraph = V1_Subgraph | V2_Subgraph;

// these two are the same
export type MetadataObject = V1_SubgraphObject | V2_SubgraphObject;

/**
 * Manual addition
 *
 * add wrapper around metadata which is not defined in the json-schema
 */

/* Model related definitions*/
export type ModelEntity = ModelDef | ModelPermissionsDef;
export type CommandEntity = CommandDef | CommandPermissionsDef;
export type ModelDef = Extract<OpenDdsObject, { kind: 'Model' }>;
export type CommandDef = Extract<OpenDdsObject, { kind: 'Command' }>;
export type ModelPermissionsDef = Extract<
  OpenDdsObject,
  { kind: 'ModelPermissions' }
>;
export type CommandPermissionsDef = Extract<
  OpenDdsObject,
  { kind: 'CommandPermissions' }
>;

/* Type related definitions */
export type ObjectTypeEntity = ObjectTypeDef | TypeOutputPermissionDef;
export type ObjectTypeDef = Extract<OpenDdsObject, { kind: 'ObjectType' }>;
export type ScalarTypeDef = Extract<OpenDdsObject, { kind: 'ScalarType' }>;
export type TypeOutputPermissionDef = Extract<
  OpenDdsObject,
  { kind: 'TypePermissions' }
>;

type RelationshipObject = Extract<OpenDdsObject, { kind: 'Relationship' }>;

type RelationshipV1_BackwardsCompatible = RelationshipV1 & {
  /**
   * @deprecated This field is deprecated and support for it will be removed in the future.
   */
  source?: string;
};

// omit the definition field from RelationshipObject and re-add it with the deprecated field
export type RelationshipDef = Omit<RelationshipObject, 'definition'> & {
  definition: RelationshipV1_BackwardsCompatible;
};

export type DataConnectorLinkDef = Extract<
  OpenDdsObject,
  { kind: 'DataConnectorLink' }
>;
export type ScalarTypeRepresentationDef = Extract<
  OpenDdsObject,
  { kind: 'DataConnectorScalarRepresentation' }
>;

export type AuthConfigDef = Extract<SupergraphObject, { kind: 'AuthConfig' }>;
