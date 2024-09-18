import { useAsync } from 'react-use';

import ReactCodeMirror from '../CodeMirror.Base';
import { getExtensions } from '../extensions/getExtensions';

export type JSONEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readonly?: boolean;
};

const JSONEditor = (props: JSONEditorProps) => {
  const { value, onChange, readonly } = props;
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

  return (
    <ReactCodeMirror
      className="w-full"
      value={value}
      extensions={extensions.value ?? []}
      readOnly={readonly === true}
      onChange={onChange}
    />
  );
};
export default JSONEditor;
