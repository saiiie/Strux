import { NextResponse } from "next/server";
import { getAllPM } from "@/lib/queries";

export const GET = async (req: Request) => {
    try {
        const projectManagers = await getAllPM();
        return NextResponse.json(projectManagers);
    } catch (err) {
        return NextResponse.json({err: 'Failed to fetch project managers'}, {status: 500});
    }
}