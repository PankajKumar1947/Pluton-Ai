"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function Home() {
  const { setTheme, theme } = useTheme()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <div className="space-y-2 text-center">
        <h1 className="text-center text-3xl">What do you want to Build ?</h1>
        <p>Prompt, run, edit, Web Application</p>
      </div>
      <div className="grid w-full gap-2 max-w-3xl bg-transparent">
        <Textarea placeholder="Type your message here." className="min-h-[120px] border-2 max-h-[200px]" />
        <Button>Send message</Button>
      </div>
    </main>
  );
}
