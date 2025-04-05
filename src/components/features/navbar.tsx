"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";

export default function Navbar() {
    const { setTheme, theme } = useTheme();
    const { data: session } = useSession();

    return (
        <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Pluton Ai</h1>
            <div className="flex items-center gap-4">
                {session?.user ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {session.user.name || session.user.email}
                        </span>
                    </div>
                ) : (
                    <Button onClick={() => signIn("google")}>Sign in</Button>
                )}
                <Button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    variant="outline"
                    size="icon"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

            </div>
        </div>
    );
}
