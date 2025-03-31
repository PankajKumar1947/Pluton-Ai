"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ChatBox from "@/components/features/chat/chat-box";
import CodeEditor from "@/components/features/editor/code-editor";
import Terminal from "@/components/features/terminal/terminal";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";


const buildFileTree = (initialFiles: any, files: any) => {
    const tree = [...initialFiles]; // Create a shallow copy to avoid direct mutation

    files.forEach(({ filePath, code }:any) => {
        const parts = filePath.split('/');
        let currentLevel = tree;

        parts.forEach((part:any, index:number) => {
            const isFile = index === parts.length - 1;

            let existingItem = currentLevel.find(item =>
                isFile ? item.filePath === part : item.folderPath === part
            );

            if (!existingItem) {
                if (isFile) {
                    existingItem = { type: "file", filePath: part, content: code };
                } else {
                    existingItem = { type: "folder", folderPath: part, files: [] };
                }
                currentLevel.push(existingItem);
            } else {
                if (isFile) {
                    existingItem.content = code; // Update file content
                }
            }

            if (!isFile) {
                currentLevel = existingItem.files;
            }
        });
    });

    return tree;
};

export default function Chat() {
    const searchParams = useSearchParams();
    const prompt = searchParams.get("prompt");
    const [files, setFiles] = useState([]);
    const [codeResponse, setCodeResponse] = useState("");
    const [artifact, setArtifact] = useState({ id: "", title: "", actions: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch UI Templates
                const response = await axios.post("/api/template", { prompt });
                setFiles(response.data?.uiPrompts?.boltArtifact?.boltAction);
                const prompts = response.data?.prompts;

                // Send the request to the /api/chats endpoint
                const res = await fetch("/api/chats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompts: [...prompts, prompt].map((content) => ({
                            role: "user",
                            content,
                        })),
                    }),
                });

                if (!res.body) return;

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk; // Accumulate stream

                    console.log("chunk", chunk);

                    // **Extract `<boltArtifact>` Data**
                    const artifactMatch = buffer.match(
                        /<boltArtifact id="(.+?)" title="(.+?)">/
                    );
                    if (artifactMatch) {
                        setArtifact((prev) => ({
                            ...prev,
                            id: artifactMatch[1],
                            title: artifactMatch[2],
                        }));
                    }

                    // **Extract `<boltAction>` Code Blocks**
                    const actionMatches = [
                        ...buffer.matchAll(
                            /<boltAction type="file" filePath="(.+?)">(.*?)<\/boltAction>/gs
                        ),
                    ];
                    if (actionMatches.length) {
                        setArtifact((prev: any) => ({
                            ...prev,
                            actions: actionMatches.map(([_, filePath, code]) => ({
                                filePath,
                                code,
                            })),
                        }));
                        

                        // files by files complete code snippet
                        actionMatches.forEach(([_, filePath, code]) => {
                            setCodeResponse(code)
                        });

                        

                        
                    }

                    // **Update Code Response Live**
                    setCodeResponse((prevResponse) => prevResponse + chunk);



                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        //@ts-ignore
        setFiles(buildFileTree(files,artifact.actions));
    }, [artifact.actions]);
    


    console.log("artifact", artifact);
    console.log("codeResponse", codeResponse);
    console.log("files", files);
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="rounded-lg w-[100vw] max-h-screen overflow-hidden"
        >
            {/* Chat Box */}
            <ResizablePanel defaultSize={30}>
                <ChatBox />
            </ResizablePanel>
            <ResizableHandle />

            <ResizablePanel defaultSize={70} className="h-screen space-y-1">
                <div className="bg-white max-w-56 rounded-2xl outline-0">
                    <button className="bg-blue-700 px-8 py-1 rounded-2xl cursor-pointer">
                        Code
                    </button>
                    <button className="text-black px-8 py-1 rounded-2xl cursor-pointer">
                        Preview
                    </button>
                </div>
                <ResizablePanelGroup direction="vertical">
                    {/* Code Editor */}
                    <ResizablePanel defaultSize={100} className="border">
                        <CodeEditor files={files} code={codeResponse} />
                    </ResizablePanel>
                    <ResizableHandle />

                    {/* Terminal */}
                    {/* <ResizablePanel defaultSize={20} className="rounded-t-2xl border">
                        <Terminal />
                    </ResizablePanel> */}
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
