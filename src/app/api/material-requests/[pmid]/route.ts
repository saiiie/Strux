import { NextResponse, NextRequest } from 'next/server';
import { getMaterialRequestsByPM, getRequestEntriesByRequestId } from '@/lib/queries';

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

        if (!requests || requests.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const requestsWithEntries = await Promise.all(
            requests.map(async (req) => {
                const entries = await getRequestEntriesByRequestId(req.request_id);
                return {
                    ...req,
                    entries: entries || [],
                };
            })
        );

        return NextResponse.json(requestsWithEntries, { status: 200 });
    } catch (error) {
        console.error('Error fetching material requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch material requests' },
            { status: 500 }
        );
    }
}