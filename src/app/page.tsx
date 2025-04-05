"use client";

import Navbar from "@/components/features/navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const router = useRouter();

  const sendPrompt = async () => {
    try {
      const response = await axios.post("/api/template", { prompt });

      if (response.status === 200) {
        const prompts = response.data?.prompts;
        prompts.push(prompt);
        const projectId = response.data?.project?.id;
        sessionStorage.setItem('prompts', JSON.stringify(prompts));
        sessionStorage.setItem('tech', response.data?.project?.tech);
        router.push(`/chat?prompt=${prompt}&projectId=${projectId}`);
      }
    } catch (error) {
      console.error("Error sending Prompt:", error);
    }

  };

  return (
    <main className="min-h-screen w-full flex-1">
        <Navbar />
      <div className="flex flex-col items-center justify-center space-y-4 flex-1 w-full mt-14 md:mt-32">
        <div className="space-y-2 text-center">
          <h1 className="text-center text-3xl">What do you want to Build ?</h1>
          <p>Prompt, run, edit, Web Application</p>
        </div>

        <form className="grid w-full gap-2 max-w-3xl bg-transparent" onSubmit={(e) => e.preventDefault()}>
          <Textarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            placeholder="Type your message here."
            className="min-h-[120px] border-2 max-h-[200px]"
          />
          <Button className="w-full" onClick={sendPrompt}>
            Send message
          </Button>
        </form>
      </div>
    </main>
  );
}
