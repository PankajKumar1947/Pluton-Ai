"use client"
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import ChatBox from "@/components/features/chat/chat-box"
import CodeEditor from "@/components/features/editor/code-editor"
import Terminal from "@/components/features/terminal/terminal"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Chat() {
    const searchParams = useSearchParams();
    const prompt = searchParams.get("prompt");
    const [files , setFiles] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('/api/template', {
                    prompt: prompt,
                });
                console.log("response",response);
                setFiles(response.data?.uiPrompts);
                
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    },[])
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
                    <button className="bg-blue-700 px-8 py-1 rounded-2xl cursor-pointer">Code</button>
                    <button className="text-black px-8 py-1 rounded-2xl cursor-pointer">Preview</button>
                </div>
                <ResizablePanelGroup direction="vertical">
                    {/* Code Editor */}
                    <ResizablePanel defaultSize={80} className="border">
                        <CodeEditor files={files} />
                    </ResizablePanel>
                    <ResizableHandle />

                    {/* Terminal */}
                    <ResizablePanel defaultSize={20} className="rounded-t-2xl border">
                        <Terminal />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}