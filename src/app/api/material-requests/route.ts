import { NextResponse, NextRequest } from 'next/server';
import { getMaterialRequestsByPM } from '@/lib/queries';


// In your API route
export async function GET(request: NextRequest, context: { params: { pmid: string } }) {
    const pmid = context.params.pmid;

    if (!pmid) {
        return NextResponse.json(
            { error: 'Missing required parameter: pmid' },
            { status: 400 }
        );
    }

    try {
        const requests = await getMaterialRequestsByPM(pmid);
        return NextResponse.json(requests, { status: 200 });
    } catch (error) {
        console.error('Error fetching material requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch material requests' },
            { status: 500 }
        );
    }
}