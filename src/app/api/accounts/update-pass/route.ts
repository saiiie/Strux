// app/api/accounts/update/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';

export async function PUT(req: Request) {
    try {
        const { pmid, password } = await req.json();

        if (!pmid || !password) {
            return NextResponse.json({ error: 'Missing pmid or password' }, { status: 400 });
        }

        console.log('NEW PASSWORD (plaintext):', password);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 1: Find the account_id based on pmid
        const accountRes = await pool.query(
            `SELECT account_id FROM project_managers WHERE pmid = $1`,
            [pmid]
        );

        if (accountRes.rowCount === 0) {
            return NextResponse.json({ error: 'PM not found' }, { status: 404 });
        }

        const accountId = accountRes.rows[0].account_id;

        await pool.query(
            `UPDATE accounts SET password = $1 WHERE account_id = $2`,
            [hashedPassword, accountId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
