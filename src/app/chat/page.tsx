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
                <div className="flex h-[200px] items-center justify-center p-6">
                    <span className="font-semibold">Chat Box</span>
                </div>
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
                        <div className="flex h-full items-center justify-center p-6">
                            <span className="font-semibold">Code Editor</span>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />

                    {/* Terminal */}
                    <ResizablePanel defaultSize={20} className="rounded-t-2xl border">
                        <div className="flex h-full items-center justify-center p-6">
                            <span className="font-semibold">Terminal</span>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}