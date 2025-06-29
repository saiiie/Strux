import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { userID, password } = await req.json();

        const result = await pool.query(
            'SELECT * FROM users WHERE userID = $1 AND password = $2',
            [userID, password]
        );

        if (result.rowCount === 1) {
            return NextResponse.json({ success: true, message: 'Login successful' });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid userID or password' }, { status: 401 });
        }
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
