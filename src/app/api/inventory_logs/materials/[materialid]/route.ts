import { NextResponse } from 'next/server';
import { getMatNamefromMaterials } from '@/lib/queries';

export async function GET(request: Request, context: { params: { materialid: string } }) {
  const { materialid } = context.params;

  try {
    if (!materialid || isNaN(Number(materialid))) {
      return NextResponse.json({ error: 'Invalid material ID' }, { status: 400 });
    }

    const materialName = await getMatNamefromMaterials(materialid);

    if (!materialName) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ name: materialName }, { status: 200 });

  } catch (error) {
    console.error('Error fetching material name:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
