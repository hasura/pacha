import type { CompletionContext } from '@codemirror/autocomplete';

// Does a non-semantic check and just give autocomplete suggestions for common tokens in metadata spec
// TODO: Do a full semantic check with position, like the sdk authoring which is aware of line numbers, hierarchy etc.
export function metadataKeywordsCompletion(context: CompletionContext) {
  const keywordsList: string[] = [];
  const word = context.matchBefore(/\w*/);

  if (!word) return null;

  if (word.from === word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: keywordsList.map(keyword => ({
      label: keyword,
      type: 'keyword',
    })),
  };
}
