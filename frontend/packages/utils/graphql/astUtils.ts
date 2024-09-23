import {
  DefinitionNode,
  DirectiveNode,
  OperationDefinitionNode,
  parse,
} from 'graphql/index';
import { DocumentNode } from 'graphql/language/ast';
import { parse as sdlParse } from 'graphql/language/parser';
import { print as sdlPrint } from 'graphql/language/printer';

export function isOperationDefinitionNode(
  definition: DefinitionNode
): definition is OperationDefinitionNode {
  return definition.kind === 'OperationDefinition';
}

export const removeDirectiveFromOperation = (
  operation: OperationDefinitionNode,
  directiveName: string
): OperationDefinitionNode => {
  return {
    ...operation,
    directives: operation.directives?.filter?.(
      directive => directive.name.value !== directiveName
    ),
  };
};

export const addDirectiveToOperation = (
  operation: OperationDefinitionNode,
  newDirective: DirectiveNode
): OperationDefinitionNode => {
  return {
    ...operation,
    directives: [...(operation.directives ?? []), newDirective],
  };
};

export function getOperationDefinitionFromQuery(
  query: string
): OperationDefinitionNode {
  const def = parse(query).definitions.find(isOperationDefinitionNode);
  if (!def) {
    throw new Error('Definition not found');
  }
  return def;
}
export function parseGraphqlStringIntoAst(
  operationString: string | undefined
): DocumentNode | undefined {
  if (!operationString) {
    return undefined;
  }
  try {
    return sdlParse(operationString);
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function printGraphqlAst(operation: DocumentNode): string {
  try {
    return sdlPrint(operation);
  } catch (e) {
    console.error(e);
    throw new Error('Cannot build the operation string');
  }
}
