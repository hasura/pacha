import type { Extension } from '@codemirror/state';

import { loadLangJson, loadLint } from '../modules';
import { jsonSchemaValidationLinter } from './jsonSchemaValidationLinter';
import { metadataKeywordsCompletion } from './metadataKeywordsCompletion';

export async function getExtensions({
  addAutoCompleteExt,
  addJsonSchemaLintExt,
  addJsonSyntaxExt = true,
  addJsonBasicLintExt = true,
  showLintGutter = true,
}: {
  /** Add custom autocomplete extension */
  addAutoCompleteExt: boolean;
  /** Add json custom schema based lint extension */
  addJsonSchemaLintExt: boolean;
  /** Add json syntax highlighting extension */
  addJsonSyntaxExt?: boolean;
  /** Show lint errors on line numbers on left side */
  showLintGutter?: boolean;
  /** Add json syntax/grammar linter extension */
  addJsonBasicLintExt?: boolean;
}) {
  const extensions: Extension[] = [];

  const { linter, lintGutter } = await loadLint();

  if (addAutoCompleteExt) {
    const { autocompletion } = await import('@codemirror/autocomplete');
    extensions.push(autocompletion({ override: [metadataKeywordsCompletion] }));
  }

  if (addJsonSchemaLintExt) {
    const { default: betterAjvErrors } = await import('better-ajv-errors');

    extensions.push(linter(jsonSchemaValidationLinter(betterAjvErrors)));
  }

  if (addJsonSyntaxExt) {
    const { json } = await import('@codemirror/lang-json');
    extensions.push(json());
  }

  if (addJsonBasicLintExt) {
    const { jsonParseLinter } = await loadLangJson();
    extensions.push(linter(jsonParseLinter()));
  }

  if (showLintGutter) {
    extensions.push(lintGutter());
  }

  return extensions;
}
