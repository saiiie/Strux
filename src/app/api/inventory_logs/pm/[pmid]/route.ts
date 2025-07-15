import { createLog } from '@/lib/queries';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { pmid: string } }) {
    try {
        const { entries } = await req.json();
        const projectId = params.pmid;

        if (!Array.isArray(entries) || entries.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty entries array' }, { status: 400 });
        }

        const logId = await createLog(projectId, entries);

        return NextResponse.json({ success: true, logId });
    } catch (error) {
        console.error('Error in POST /inventory_logs/pm/[pmid]:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
