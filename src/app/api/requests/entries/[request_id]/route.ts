import { NextResponse } from 'next/server';
import { getRequestEntriesByRequestId } from '@/lib/queries';

export async function GET(
    req: Request,
    context: { params: { request_id: string } }
) {
    const requestId = Number(context.params.request_id);

    if (!requestId) {
        return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
    }

    try {
        const entries = await getRequestEntriesByRequestId(requestId);
        return NextResponse.json(entries, { status: 200 });
    } catch (err) {
        console.error('Error fetching request entries:', err);
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }
}
