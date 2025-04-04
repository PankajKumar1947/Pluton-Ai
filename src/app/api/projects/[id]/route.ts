// In src/app/api/projects/[id]/route.ts
import { nodeBasePrompt } from "@/defaults/nodej";
import { reactBasePrompt } from "@/defaults/react";
import prisma from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1]; 
    try {
        const project = await prisma.project.findUnique({
            where: {
                id: id
            },
            include: {
                versions: true
            }
        });

        let template = {};
        if (project?.tech === "react") {
            template = reactBasePrompt;
        } else if (project?.tech === "node") {
            template = nodeBasePrompt;
        }

        return NextResponse.json(
            { message: "Project fetched successfully", data: project, template },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}