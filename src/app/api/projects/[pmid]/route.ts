import { NextResponse } from 'next/server';
import { getProjectByPM } from '@/lib/queries';

export async function GET(req: Request, context: { params: { pmid: string } }) {
    try {
        const pmid = context.params.pmid;
        const projects = await getProjectByPM(pmid);
        return NextResponse.json(projects);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

