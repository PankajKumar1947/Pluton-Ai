"use client"

import { useState } from "react";
import FileStructure from "./files-structure";
import MonacoEditor from "./monaco-editor";

export default function CodeEditor({files, code}:any) {
    const [activeFile, setActiveFile] = useState<any>({});
    return (
        <div className="h-full flex w-full">
            <div className="w-1/5 border">
                <FileStructure files={files} setActiveFile={setActiveFile}/>
            </div>
            <div className="w-4/5">
                <MonacoEditor value={activeFile?.content} code={code}/>
            </div>
        </div>
    )
}