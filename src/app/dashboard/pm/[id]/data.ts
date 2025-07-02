'use server'
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function fetchProjects(req: NextRequest) {

    const { searchParams } = new URL(req.url);
    const pmid = searchParams.get('pmid');

    try {
        const projects = await pool.query(
            'SELECT * FROM projects WHERE pmid = 1'
        )

        if (projects.rowCount < 1) {
            return NextResponse.json({ success: false, message: 'No projects assigned' });
        }

        const project = projects.rows[0];

        return NextResponse.json({
            success: true,
            ...project,
        });


    } catch (error: any) {
        console.error('Failed to fetch projects: ', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}