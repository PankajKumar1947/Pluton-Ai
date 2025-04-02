import prisma from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
    const data = await req.json();
    try {
        const { userId, files, projectId, projectName } = data;

        if (!userId || !files) {
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

        const projectExist = prisma.project.findUnique({
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
                    code: JSON.stringify(files)
                }
            })

            return NextResponse.json(
                { message: "Project created successfully", project },
                { status: 200 }
            );
        } else {
            //update the project
            const project = await prisma.project.update({
                where: {
                    id: projectId,
                },
                data: {
                    code: JSON.stringify(files)
                }
            })

            return NextResponse.json(
                { message: "Project updated successfully", project },
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