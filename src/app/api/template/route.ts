import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { BASE_PROMPT } from "@/constants/prompts";
import { reactBasePrompt } from "@/defaults/react";
import { nodeBasePrompt } from "@/defaults/nodej";

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

export async function POST(req: NextRequest, res: NextRequest) {
    const prompt = await req.json();

    try {
        if (!prompt) {
            return NextResponse.json(
                { message: "Prompt is required" },
                { status: 400 }
            )
        }

        //1. ask the llm whether the project is react or node,  get answer in only one word
        const result = await client.chat.complete({
            model: 'mistral-large-latest',
            messages: [
                {
                    role: 'system',
                    content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
                },
                {
                    role: 'user',
                    content: prompt?.prompt
                }
            ],
            maxTokens: 200
        })

        //@ts-ignore
        const answer = result.choices[0].message.content

        if (answer === "react") {
            return NextResponse.json(
                {
                    prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${JSON.stringify(reactBasePrompt)}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                    uiPrompts: reactBasePrompt
                },
                { status: 200 }
            )

            //NOTE THAT: prompts are again taken back from the frontend to give to the llm to generate the steps
            // ans uiPrompts will be used by the webcontainer to initalize the project. uiPromps contains the set of folder and files which has to be created
        }

        if (answer === "node" || answer === "Node") {
            return NextResponse.json(
                {
                    prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${JSON.stringify(nodeBasePrompt)}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                    uiPrompts: nodeBasePrompt
                },
                { status: 200 })
        }

        return NextResponse.json(
            { message: "Prompt received" },
            { status: 200 }

        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}