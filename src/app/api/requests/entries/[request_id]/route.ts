import { NextRequest, NextResponse } from 'next/server';
import { getRequestEntriesByRequestId } from '@/lib/queries';

export async function GET(
    req: NextRequest,
    context: { params: { request_id: string } }
) {
    const { request_id } = context.params;

    const requestIdNum = Number(request_id);
    if (!requestIdNum) {
        return NextResponse.json({ error: 'Missing or invalid request_id' }, { status: 400 });
    }

    try {
        const entries = await getRequestEntriesByRequestId(requestIdNum);
        return NextResponse.json(entries);
    } catch (error) {
        console.error('Error fetching entries by request_id:', error);
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }
}
