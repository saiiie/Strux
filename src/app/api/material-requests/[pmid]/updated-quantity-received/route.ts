import { NextResponse } from 'next/server';
import { updateQtyReceived } from '@/lib/queries';

export async function PUT(req: Request, { params }: { params: { pmid: string } }) {
  try {
    const body = await req.json();
    const { entries } = body;
    console.log(entries);
    console.log('HELLOOOOOOO');

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    await updateQtyReceived(entries);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Failed to update qty_received:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
