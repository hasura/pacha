import type { Diagnostic } from '@codemirror/lint';
import type { EditorView } from '@codemirror/view';

export const jsonSchemaValidationLinter =
  (betterAjvErrors: (typeof import('better-ajv-errors'))['default']) =>
  (view: EditorView) => {
    const currentText = view.state.doc.toString();
    const diagnostics: Diagnostic[] = [];

    try {
      const metadata = JSON.parse(currentText);
      const valid = true;
      if (!valid) {
        const output = betterAjvErrors({}, metadata, [], {
          format: 'js',
          json: currentText,
        });

        output.forEach(out => {
          if (out.start.line) {
            diagnostics.push({
              from: out.start.offset,
              to: out.start.offset,
              severity: 'error',
              message: out.error,
            });
          }
        });
      }
    } catch (e) {
      console.error(e);
    }

    return diagnostics;
  };
