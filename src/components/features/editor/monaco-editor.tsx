import Editor from '@monaco-editor/react';

export default function MonacoEditor() {
    return (
        <Editor
            theme='vs-dark'
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// some comment"
        />
    )
}