import { Kind } from 'graphql/language';
import { DocumentNode, OperationTypeNode } from 'graphql/language/ast';
import { produce } from 'immer';

import {
  isOperationDefinitionNode,
  parseGraphqlStringIntoAst,
  printGraphqlAst,
} from './astUtils';

const CACHE_DIRECTIVE_NAME = 'cached';

const hasCachedDirectiveFromAst = (operationAst: DocumentNode): boolean => {
  return operationAst.definitions.some(def => {
    if (!isOperationDefinitionNode(def) || !def.directives) {
      return false;
    }
    return def.directives.some(dir => dir.name.value === CACHE_DIRECTIVE_NAME);
  });
};

export const hasCachedDirective = (
  operationString: string | undefined
): boolean => {
  const operationAst = parseGraphqlStringIntoAst(operationString);
  if (!operationAst) {
    return false;
  }

  return hasCachedDirectiveFromAst(operationAst);
};

export const toggleCacheDirective = (
  operationString: string | undefined
): string => {
  const operationAst = parseGraphqlStringIntoAst(operationString);
  if (!operationAst) {
    return operationString ?? '';
  }

  const shouldAddCacheDirective = !hasCachedDirectiveFromAst(operationAst);

  // operationAst.definitions is a read only array, it means that we cannot modify the array directly.
  // Thankfully, we can use immer to do such tasks, and keep graphql types
  const newOperationAst = produce<DocumentNode>(operationAst, prev => {
    if (!prev.definitions) {
      return prev;
    }
    for (const definition of prev.definitions) {
      if (!isOperationDefinitionNode(definition)) {
        continue;
      }
      if (definition.operation !== OperationTypeNode.QUERY) {
        continue;
      }
      definition.directives = definition.directives ?? [];
      definition.directives = definition.directives.filter(
        directive => directive.name.value !== CACHE_DIRECTIVE_NAME
      );
      if (shouldAddCacheDirective) {
        definition.directives.push({
          name: { kind: Kind.NAME, value: CACHE_DIRECTIVE_NAME },
          kind: Kind.DIRECTIVE,
        });
      }
    }
    return prev;
  });

  // This is needed to have the parsing work correctly, otherwise, graphiql dosn't want to parse it
  const finalValue = JSON.parse(JSON.stringify(newOperationAst));

  return printGraphqlAst(finalValue);
};
