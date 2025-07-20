import { NextResponse } from 'next/server';
import { reviewMaterialRequest } from '@/lib/queries';

export async function POST(req: Request ,context: { params: { request_id: string } }) {
    try {
        const body = await req.json();
        const { entries, requestStatus } = body;

        const { request_id } = context.params;
        const requestIdNum = Number(request_id);

        if (!Array.isArray(entries)) {
            return NextResponse.json({ success: false, error: 'Entries must be an array' }, { status: 400 });
        }

        await reviewMaterialRequest(requestIdNum, entries, requestStatus);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to review material request:', error);
        return NextResponse.json({ success: false, error: 'Failed to review request' }, { status: 500 });
    }
}
