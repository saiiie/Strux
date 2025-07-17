// /api/accounts/settings/route.ts
import { NextResponse } from 'next/server';
import { getPMAccount } from '@/lib/queries';

export const GET = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const currentUser = searchParams.get('currentUser');

    if (!currentUser) {
        return NextResponse.json({ error: 'Missing currentUser param' }, { status: 400 });
    }

    try {
        const account = await getPMAccount(currentUser);
        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
    }
};
