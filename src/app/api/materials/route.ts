import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const res = await pool.query('SELECT material_id, name FROM materials ORDER BY name');
        return NextResponse.json(res.rows);
    } catch (err) {
        console.error('Error fetching materials:', err);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
