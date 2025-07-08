'use server'
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const POST = async (req: NextRequest) => {
    try {
        
        const { projectName, location } = await req.json();

        const result = await pool.query(
            'INSERT INTO projects (projectName, location) VALUES ($1, $2) returning *',
            [projectName, location]
        );

        return NextResponse.json({success: true, project: result.rows[0]});

    } catch (err: any) {
        return new Response(JSON.stringify({error: 'Failed to insert project'}), {status: 500});
    }
}