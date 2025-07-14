'use server'

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.log_date ) {
      return NextResponse.json(
        { error: 'Missing required fields log_date' },
        { status: 400 }
      );
    }
    if (!data.projectid) {
      return NextResponse.json(
        { error: 'Missing required fields projectid' },
        { status: 400 }
      );
    }

     if (!Array.isArray(data.log_entries)) {
      return NextResponse.json(
        { error: 'Missing required fields log_entries' },
        { status: 400 }
      );
    }


    // Parse log_date to ensure valid timestamp
    const logDate = new Date(data.log_date);
    if (isNaN(logDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid log_date format. Expected YYYY-MM-DD HH:MM:SS' },
        { status: 400 }
      );
    }

    // Insert into inventory_logs
    const query = `
      INSERT INTO inventory_logs (
        log_date,
        projectid,
        project,
        log_entries
      ) VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      logDate.toISOString(),
      data.projectid,
      JSON.stringify(data.project),
      JSON.stringify(data.log_entries)
    ];
    console.log("values: ",values)

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error inserting log entry:', error);
    return NextResponse.json(
      { error: 'Failed to insert log entry' },
      { status: 500 }
    );
  }
}