import { NextResponse } from 'next/server';
import { changeProjectDetails } from '@/lib/queries';

export const PUT = async (req: Request) => {
  try {
    const { project } = await req.json();
    console.log(project);
    const result = await changeProjectDetails({project});
    return NextResponse.json({ message: 'Status updated', rowCount: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
};
