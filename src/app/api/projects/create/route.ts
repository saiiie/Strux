'use server'
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const POST = async (req: NextRequest) => {
    try {
        
        const { pmid, projectName, location, startdate, enddate, status, client} = await req.json();

        const result = await pool.query(
            'INSERT INTO projects (pmid, projectName, location, startdate, enddate, status, client) VALUES ($1, $2, $3, $4, $5, $6, $7) returning *',
            [pmid, projectName, location, startdate, enddate, status, client]
        );

        return NextResponse.json({success: true, project: result.rows[0]});

    } catch (err: any) {
        return new Response(JSON.stringify({error: 'Failed to insert project'}), {status: 500});
    }
}