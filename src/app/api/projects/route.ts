import prisma from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const data = await req.json();
    try {
        const { userId, files, projectId, projectName } = data;

        if (!userId || !files.length) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

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

        const projectExist = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })

        if (!projectExist) {
            // create project
            const project = await prisma.project.create({
                data: {
                    ownerId: userId,
                    name: projectName,
                    files: files
                }
            })

            return NextResponse.json(
                { message: "Project created successfully", project },
                { status: 200 }
            );
        } else {
            //update the project
            await prisma.project.update({
                where: {
                    id: projectId,
                },
                data: {
                    files: files,
                    name: projectName,
                }
            })

            return NextResponse.json(
                { message: "Project updated successfully" },
                { status: 200 }
            );
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId") as string;
    try {
        const projects = await prisma.project.findMany({
            where: {
                ownerId: userId
            },
            select:  {
                id: true,
                name: true
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