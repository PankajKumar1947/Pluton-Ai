"use client"

import FileStructure from "./files-structure";
import MonacoEditor from "./monaco-editor";

export default function CodeEditor() {
    return (
        <div className="h-full flex w-full">
            <div className="w-1/5 border">
                <FileStructure />
            </div>
            <div className="w-4/5">
                <MonacoEditor />
            </div>
        </div>
    )
}