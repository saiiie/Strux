import { getMatNamefromMaterials } from '@/lib/queries';

export async function GET(request, { params }) {
  const { materialid } = params;

  try {
    // Validate input
    if (!materialid || isNaN(Number(materialid))) {
      return new Response(JSON.stringify({ error: 'Invalid material ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch material name
    const materialName = await getMatNamefromMaterials(materialid);

    if (!materialName) {
      return new Response(JSON.stringify({ error: 'Material not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ name: materialName }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching material name:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}