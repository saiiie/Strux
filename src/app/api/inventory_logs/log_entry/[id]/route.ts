import { NextRequest } from 'next/server';
import { getLogEntriesByLogId } from '@/lib/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  const { id } = await params;

  try {
    const logEntries = await getLogEntriesByLogId(id);

    if (!logEntries || logEntries.length === 0) {
      return new Response(JSON.stringify({ error: 'No log entries found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(logEntries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching log entries:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
