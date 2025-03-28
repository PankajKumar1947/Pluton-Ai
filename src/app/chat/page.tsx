import ChatBox from "@/components/features/chat/chat-box"
import CodeEditor from "@/components/features/editor/code-editor"
import Terminal from "@/components/features/terminal/terminal"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Chat() {
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
                        <CodeEditor />
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