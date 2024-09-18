import {
  AuthConfigDef,
  CommandDef,
  CommandPermissionsDef,
  DataConnectorLinkDef,
  MetadataObject,
  ModelDef,
  ModelPermissionsDef,
  ObjectTypeDef,
  RelationshipDef,
  ScalarTypeDef,
  ScalarTypeRepresentationDef,
  SupergraphObject,
  TypeOutputPermissionDef,
} from './additionalTypes';
import {
  Function as MetadataFunction,
  Procedure,
  V1_Metadata,
  V2_Metadata,
  V2_SubgraphObject,
} from './generatedMetadataTypes';

export const isV1Metadata = (
  metadata: V1_Metadata | V2_Metadata
): metadata is V1_Metadata => {
  return metadata.version === 'v1';
};

export const isModelDef = (object: MetadataObject): object is ModelDef => {
  return object.kind === 'Model';
};

export const isCommandDef = (object: MetadataObject): object is CommandDef => {
  return object.kind === 'Command';
};

export const isCommandOrModelDef = (
  object: MetadataObject
): object is CommandDef | ModelDef => {
  return isCommandDef(object) || isModelDef(object);
};

export const isModelPermissionsDef = (
  object: MetadataObject
): object is ModelPermissionsDef => {
  return object.kind === 'ModelPermissions';
};

export const isCommandPermissionsDef = (
  object: MetadataObject
): object is CommandPermissionsDef => {
  return object.kind === 'CommandPermissions';
};

export const isObjectTypeDef = (
  object: MetadataObject
): object is ObjectTypeDef => {
  return object.kind === 'ObjectType';
};

export const isTypeOutputPermissionDef = (
  object: MetadataObject
): object is TypeOutputPermissionDef => {
  return object.kind === 'TypePermissions';
};

export const isRelationshipTypeDef = (
  object: MetadataObject
): object is RelationshipDef => {
  return object.kind === 'Relationship';
};

export const isDataConnectorLinkDef = (
  object: MetadataObject
): object is DataConnectorLinkDef => {
  return object.kind === 'DataConnectorLink';
};

export const isScalarTypeRepresentationDef = (
  object: MetadataObject
): object is ScalarTypeRepresentationDef => {
  return object.kind === 'DataConnectorScalarRepresentation';
};

export const isScalarTypeDef = (
  object: MetadataObject
): object is ScalarTypeDef => {
  return object.kind === 'ScalarType';
};

export const isProcedureSource = (
  object: MetadataFunction | Procedure
): object is Procedure => {
  return 'procedure' in object;
};

export const isFunctionSource = (
  object: MetadataFunction | Procedure
): object is MetadataFunction => {
  return 'function' in object;
};

export const isAuthConfig = (
  object: SupergraphObject | V2_SubgraphObject
): object is AuthConfigDef => {
  return object.kind === 'AuthConfig';
};
