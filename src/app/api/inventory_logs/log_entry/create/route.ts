'use server'

import { NextRequest, NextResponse } from 'next/server';
import { createLogEntry } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Expected an array of log entries' },
        { status: 400 }
      );
    }

    const successes = [];
    const failures = [];

    for (const entry of data) {
      try {
        await createLogEntry(entry);
        successes.push(entry);
      } catch (err) {
        console.error('Failed to insert entry:', entry, err);
        failures.push({ entry, error: err.message });
      }
    }

    if (failures.length > 0) {
      return NextResponse.json(
        {
          message: `${successes.length} entries inserted, ${failures.length} failed`,
          successes,
          failures,
        },
        { status: 207 } // Multi-status
      );
    }

    return NextResponse.json(
      { message: 'All log entries created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error during batch insert:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}