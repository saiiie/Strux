// /app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { getAllAccounts } from '@/lib/queries';

export const GET = async (req: Request) => {
    try {
        const accounts = await getAllAccounts();
        return NextResponse.json(accounts);

    } catch (error) {
        return NextResponse.json({error: 'Failed to fetch accounts'}, {status: 500});
    }
}