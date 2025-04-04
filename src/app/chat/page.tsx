"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ChatBox from "@/components/features/chat/chat-box";
import CodeEditor from "@/components/features/editor/code-editor";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import Preview from "@/components/features/preview/preview";
import { WebContainer } from "@webcontainer/api";
import axios from "axios";
import { reactBasePrompt } from "@/defaults/react";
import { nodeBasePrompt } from "@/defaults/nodej";
import CodeLoader from "@/components/code-loader";


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

const updateFile = (prevFile: any, newFiles: any) => {
    for (let i = 0; i < newFiles.length; i++) {
        let j = 0;
        for (j = 0; j < prevFile.length; j++) {
            if (prevFile[j].filePath === newFiles[i].filePath) {
                prevFile[j].code = newFiles[i].code;
                break;
            }
        }
        if (j === prevFile.length) {
            prevFile.push(newFiles[i]);
        }
    }
    return prevFile;
};

export default function Chat() {
    const searchParams = useSearchParams();
    const prompt = searchParams.get("prompt");
    const projectId = searchParams.get("projectId");
    const tech = sessionStorage.getItem("tech");
    const [files, setFiles] = useState(tech === "react" ? reactBasePrompt?.boltArtifact?.boltAction : nodeBasePrompt);
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
    const [updateStatus, setUpdateStatus] = useState(false);
    const [previousFile, setPreviousFile] = useState([]);
    const [fetchPreviousFile, setFetchPreviousFile] = useState(prompt ? false : true);

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
                    buffer += chunk;

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
                setUpdateStatus(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const getProjectById = async (projectId: string) => {
            try {
                const response = await axios.get(`/api/projects/${projectId}`);
                const versions = response.data?.data?.versions;
                setFiles(buildFileTree(files, versions[versions?.length - 1]?.files));
                if (!webcontainer) {
                    const webcontainerInstance = await WebContainer.boot();
                    setWebcontainer(webcontainerInstance)
                }
                setPreview(true)
                setFetchPreviousFile(false)

            } catch (error) {
                console.log("error ", error);
                return null;
            }
        }

        if (fetchPreviousFile) {
            getProjectById(projectId as string);
        } else {
            fetchData();
        }


    }, [followUpPromptStatus]);

    const saveFilesToDB = async (newFiles: any) => {
        try {
            setSaving(true);
            const response = await axios.post("/api/projects", {
                userId: "cm9195ao70000356owa054inb",
                files: newFiles,
                projectId: projectId,
                name: prompt,
                version: 1
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

    useEffect(() => {

        if (updateStatus) {
            let newFiles = updateFile(previousFile, artifact.actions);
            setPreviousFile(newFiles);
            saveFilesToDB(newFiles);
            console.log("updateStatus", updateStatus);
            console.log("files", newFiles);
            setUpdateStatus(false);
        }

    }, [updateStatus]);
    return (
        <div className="w-[100vw] max-h-screen overflow-hidden">
            <div className="px-4 py-3 flex justify-between">
                <h1 className="text-2xl font-bold text-indigo-600">Pluton Ai</h1>
                <h1 className="text-center">{artifact?.title || "Pluton AI"}</h1>
                <div className="space-x-2 text-sm">
                    {/* <button disabled={saving} onClick={saveFilesToDB} className="bg-blue-700 px-4 py-1 rounded-2xl cursor-pointer">{saving ? "Saving..." : "Save"} </button> */}
                    <button className="bg-blue-700 px-4 py-1 rounded-2xl cursor-pointer">Download</button>
                </div>
            </div>
            {
                fetchPreviousFile ? <CodeLoader /> : (
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
                            <div className="bg-white max-w-36 flex justify-between rounded-2xl outline-0 text-sm">
                                <button onClick={() => setPreview(false)} className={`${!preview ? "bg-blue-700" : "bg-white text-black"}  py-1 px-4 rounded-2xl cursor-pointer`}>
                                    Code
                                </button>
                                <button onClick={() => setPreview(true)} className={` py-1 px-4 ${preview ? "bg-blue-700" : "bg-white text-black"} rounded-2xl cursor-pointer`}>
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
                                </ResizablePanelGroup>
                            }
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )
            }
        </div>
    );
}
