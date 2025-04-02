import { NextRequest } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { getSystemPrompt } from "@/constants/prompts";

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey });

export async function POST(req: NextRequest) {
    const { prompts } = await req.json();

    try {
        if (!prompts || prompts.length === 0) {
            return new Response(
                JSON.stringify({ message: "No prompts found" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Call the API with streaming enabled
        const response = await client.chat.stream({
            model: "mistral-large-latest",
            messages: [
                { role: "system", content: getSystemPrompt() },
                ...prompts,
            ],
            maxTokens: 1000,
        });

        const stream = new ReadableStream({
            async start(controller) {
                
                console.log("response", response);
                //@ts-ignore
                for await (const chunk of response) {
                    const text = chunk.data.choices[0].delta.content || "";

                    // Log data on the server
                    console.log("Streaming chunk:", text);

                    // Send data to the client
                    // @ts-ignore
                    controller.enqueue(new TextEncoder().encode(text));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ message: "Error in fetching data" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
