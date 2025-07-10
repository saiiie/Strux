'use server'
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const POST = async (req: NextRequest) => {
    try {
        const { username, password, role, fname, lname } = await req.json();

        const accountResult = await pool.query(
            'INSERT INTO accounts (username, password, role) VALUES ($1, $2, $3) RETURNING account_id',
            [username, password, role]
        );

        const account_id = accountResult.rows[0].account_id;

        if (role === 'Project Manager') {
            await pool.query(
                'INSERT INTO project_managers (account_id, fname, lname) VALUES ($1, $2, $3)',
                [account_id, fname, lname]
            );
        }

        return NextResponse.json({ success: true, account_id });

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to insert account' }), { status: 500 });
    }
}
