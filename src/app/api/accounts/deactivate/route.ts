import { NextResponse } from 'next/server';
import { changeAccountStatus } from '@/lib/queries';

export const PUT = async (req: Request) => {
  try {
    const { username, is_active } = await req.json();
    const result = await changeAccountStatus({ newStatus: is_active, username });
    return NextResponse.json({ message: 'Status updated', rowCount: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
};
