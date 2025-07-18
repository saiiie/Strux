import { NextResponse } from 'next/server';
import { createMaterialRequest } from '@/lib/queries';

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    try {
        const body = await req.json();
        const { entries } = body;
        const requestId = await createMaterialRequest(params.projectId, entries);

        return NextResponse.json({ success: true, requestId });
    } catch (error) {
        console.error('Failed to submit material request:', error);
        return NextResponse.json({ success: false, error: 'Failed to create request' }, { status: 500 });
    }
}
