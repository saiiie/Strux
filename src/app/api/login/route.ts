'use server'
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        const result = await pool.query(
            'SELECT * FROM accounts WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rowCount !== 1) {
            return NextResponse.json({success: false, message: 'Account not found'});
        }

        const { account_id, role } = result.rows[0];

        let userID = null;
        if (role === 'pm') {
            const pmResult = await pool.query(
                'SELECT pmid FROM project_managers WHERE account_id = $1', [account_id]
            );

            if (pmResult.rowCount === 1) {
                userID = pmResult.rows[0].pmid;
            }
        }

        return NextResponse.json({
            success: true,
            role,
            userID,
            message: 'Login successful'
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}