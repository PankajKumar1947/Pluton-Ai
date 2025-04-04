import prisma from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const data = await req.json();
    try {
        const { name, version, projectId, files } = data;

        if (!name || !version || !projectId || !files.length) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // TODO
        /*
        const userExist = prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!userExist) {
            return NextResponse.json(
                { message: "User does not exist" },
                { status: 400 }
            );
        }
        */

        const projectExist = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })

        if (!projectExist) {
            return NextResponse.json(
                { message: "Project does not exist" },
                { status: 400 }
            );
        }

        // creating the version of the project
        const projectVersion = await prisma.version.create({
            data: {
                name,
                version: version+1,
                projectId,
                files
            }
        })

        return NextResponse.json(
            { message: "Project created successfully", data: projectVersion },
            { status: 200 },
        );
        
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const projects = await prisma.project.findMany({
            where: {
                ownerId: "cm9195ao70000356owa054inb" // TODO
            },
            select:  {
                id: true,
                name: true,
                tech: true
            }
        })
        return NextResponse.json(
            { message: "Projects fetched successfully", data: projects },
            { status: 200 },
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}