import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ChatBox({ llmMessage, setLlmMessage, setFollowUpPromptStatus }: any) {
    const [message, setMessage] = useState<string>("");

    const handleSendMessage = () => {
        setLlmMessage([...llmMessage,
        { role: "user", content: message }
        ]);
        setFollowUpPromptStatus((prev: boolean) => !prev);
        setMessage('');
    }
    return (
        <div className="border h-full relative">
            <div className="p-4">
                <h1 className="font-semibold text-center">Chat Messages</h1>
                <div className="mt-4 min-h-[400px] overflow-y-auto">
                    {
                        llmMessage
                            .filter((message: any) => message.role.trim() === "user") // Ensure no extra spaces
                            .slice(2)
                            .map((message: any, index: number) => (
                                <div key={index} className="flex justify-start mb-2 bg-slate-800 px-4 py-2 rounded-lg">
                                    {message.content}
                                </div>
                            ))
                    }
                </div>
            </div>


            <div className="absolute bottom-14 w-full p-4">
                <form className="grid w-full gap-2 max-w-3xl bg-transparent" onSubmit={(e) => e.preventDefault()}>
                    <Textarea
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        placeholder="Type your message here."
                        className="min-h-[80px] border-2 max-h-[120px]"
                    />
                    <Button className="w-full" onClick={handleSendMessage}>
                        Send message
                    </Button>
                </form>
            </div>
        </div>
    )
}
