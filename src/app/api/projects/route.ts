// /app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/queries';

export const GET = async (req: Request) => {
    try {
        const projects = await getAllProjects();
        return NextResponse.json(projects);

    } catch (error) {
        return NextResponse.json({error: 'Failed to fetch projects'}, {status: 500});
    }
}