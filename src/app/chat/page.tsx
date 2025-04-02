"use client";

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
import Preview from "@/components/features/preview/preview";
import { WebContainer } from "@webcontainer/api";
import { Button } from "@/components/ui/button";
import axios from "axios";


const buildFileTree = (initialFiles: any, files: any) => {
    const tree = [...initialFiles];

    files.forEach(({ filePath, code }: any) => {
        const parts = filePath.split('/');
        let currentLevel = tree;

        parts.forEach((part: any, index: number) => {
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
                    existingItem.content = code; // Updating file content
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
    const [files, setFiles] = useState(JSON.parse(sessionStorage.getItem('files') || '[]'));
    const [codeResponse, setCodeResponse] = useState("");
    const [artifact, setArtifact] = useState({ id: "", title: "", actions: [] });
    const [preview, setPreview] = useState(false);
    const [disablePreview, setDisablePreview] = useState(false);
    const [webcontainer, setWebcontainer] = useState<WebContainer>();
    const [url, setUrl] = useState('');

    const storedPrompts = sessionStorage.getItem('prompts');
    const prompts: string[] = storedPrompts ? JSON.parse(storedPrompts) : [];
    const [llmMessage, setLlmMessage] = useState<{ role: string; content: string }[]>(
        prompts.map((content) => ({
            role: "user",
            content: content,
        }))
    );
    const [followUpPromptStatus, setFollowUpPromptStatus] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setPreview(false);
                // Send the request to the /api/chats endpoint
                const res = await fetch("/api/chats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompts: llmMessage,
                    }),
                });
                if (res.status !== 200) {
                    return
                }

                if (!res.body) return;

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk; // Accumulate stream

                    // console.log("chunk", chunk);

                    // Extract `<boltArtifact>` Data
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

                    // Extract `<boltAction>` Code Blocks*
                    const actionMatches = [
                        ...buffer.matchAll(
                            //@ts-ignore
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
                    // Update Code Response Live
                    setCodeResponse((prevResponse) => prevResponse + chunk);
                }


                // //@ts-ignore
                // setLlmMessage([...prompts, prompt].map(content => ({
                //     role: "",
                //     content
                // })));

                setLlmMessage((prev) => [
                    ...prev,
                    { role: "assistant", content: buffer }
                ])

                if (!webcontainer) {
                    const webcontainerInstance = await WebContainer.boot();
                    setWebcontainer(webcontainerInstance)
                }

                setDisablePreview(true);
                setPreview(true);
                setUrl("");
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [followUpPromptStatus]);

    const saveFilesToDB = async () => {
        try {
            setSaving(true);
            const response = await axios.post("/api/projects", {
                userId: "cm8zhuaew0000356phofi235d",
                files: files,
                projectId: "cm8zntmmv0001n6z8sqfqgydo",
                projectName: prompt
            });

            if (response.status === 200) {
                console.log("response", response);
                setSaving(false);
            }
        } catch (error) {
            console.error("Saving Code:", error);
            setSaving(false);
        }

    }

    useEffect(() => {
        //@ts-ignore
        setFiles(buildFileTree(files, artifact.actions));
    }, [artifact.actions]);


    // console.log("artifact", artifact);
    // console.log("codeResponse", codeResponse);
    // console.log("files", files);
    return (
        <div className="w-[100vw] max-h-screen overflow-hidden">
            <div className="px-4 py-3 flex justify-between">
                <h1 className="text-2xl font-bold text-indigo-600">Pluton Ai</h1>
                <h1 className="text-center">{artifact?.title || "Pluton AI"}</h1>
                <div className="space-x-2 text-sm">
                    <button onClick={saveFilesToDB} className="bg-blue-700 px-4 py-1 rounded-2xl cursor-pointer">Save</button>
                    <button className="bg-blue-700 px-4 py-1 rounded-2xl cursor-pointer">Download</button>
                </div>
            </div>
            <ResizablePanelGroup
                direction="horizontal"
                className="border"
            >
                {/* Chat Box */}
                <ResizablePanel defaultSize={30}>
                    <ChatBox llmMessage={llmMessage} setLlmMessage={setLlmMessage} setFollowUpPromptStatus={setFollowUpPromptStatus} />
                </ResizablePanel>
                <ResizableHandle />

                <ResizablePanel defaultSize={70} className="space-y-1 h-screen mt-2 px-2">
                    <div className="bg-white max-w-56 flex justify-between rounded-2xl outline-0">
                        <button onClick={() => setPreview(false)} className={`${!preview ? "bg-blue-700" : "bg-white text-black"} px-8 py-1 rounded-2xl cursor-pointer`}>
                            Code
                        </button>
                        <button onClick={() => setPreview(true)} className={`px-8 py-1 ${preview ? "bg-blue-700" : "bg-white text-black"} rounded-2xl cursor-pointer`}>
                            Preview
                        </button>
                    </div>

                    {
                        preview ? (
                            <Preview files={files} webContainerInstance={webcontainer} url={url} setUrl={setUrl} />
                        ) : <ResizablePanelGroup direction="vertical" className="h-full">
                            {/* Code Editor */}
                            <ResizablePanel defaultSize={100} >
                                <CodeEditor files={files} code={codeResponse} />
                            </ResizablePanel>

                            {/* Terminal */}
                            {/* <ResizablePanel defaultSize={20} className="rounded-t-2xl border">
                            <Terminal />
                        </ResizablePanel> */}
                        </ResizablePanelGroup>
                    }
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
