import { useEffect, useRef } from 'react';
import { EditorSelection } from '@codemirror/state';
import { useAsync } from 'react-use';

import ReactCodeMirror, { ReactCodeMirrorRef } from '../CodeMirror.Base';
import { getExtensions } from '../extensions/getExtensions';

export type JSONEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readonly?: boolean;
  selection?: EditorSelection;
};

const JSONEditor = (props: JSONEditorProps) => {
  const { value, onChange, readonly = true, selection } = props;
  const editorRef = useRef<ReactCodeMirrorRef>(null); // Ref for the CodeMirror editor instance

  // Load extensions asynchronously
  const extensions = useAsync(
    () =>
      getExtensions({
        addAutoCompleteExt: false,
        addJsonSchemaLintExt: false,
        addJsonBasicLintExt: true,
        addJsonSyntaxExt: true,
        showLintGutter: true,
      }),
    []
  );

  // Function to scroll to the current selection

  // Trigger scrollToSelection when the selection changes
  useEffect(() => {
    if (editorRef.current && selection) {
      const editorView = editorRef.current.view; // Get the editor view from the ref

      if (editorView) {
        // Dispatch the new selection and scroll it into view

        editorView.dispatch({
          selection: selection,
          scrollIntoView: true, // Ensure the scrollIntoView behavior
        });
      }
    }
  }, [editorRef.current?.view, selection]);

  return (
    <ReactCodeMirror
      ref={editorRef} // Attach ref to ReactCodeMirror
      className="w-full"
      value={value}
      extensions={extensions.value ?? []}
      readOnly={readonly === true}
      onChange={onChange}
      selection={selection} // Pass the selection prop
    />
  );
};

export default JSONEditor;
