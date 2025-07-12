import { NextResponse } from 'next/server';
import { getAllRequests } from '@/lib/queries';

export const GET = async (req: Request) => {
    try {
        const requests = await getAllRequests();
        return NextResponse.json(requests);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({error: 'Failed to fetch material requests.'}, {status: 500});
    }
}