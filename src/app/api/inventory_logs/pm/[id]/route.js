import { getInventoryLogsByPM } from '@/lib/queries';

export async function GET(request, { params }) {
    const { id } = params;
    try {
        const logs = await getInventoryLogsByPM(id);
        return Response.json(logs);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}