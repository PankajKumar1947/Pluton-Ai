import Editor from '@monaco-editor/react';

export default function MonacoEditor({value}:any) {
    return (
        <Editor
            theme='vs-dark'
            height="100%"
            defaultLanguage="javascript"
            value={value}
        />
    )
}