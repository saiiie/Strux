import { getInventoryLogsByPM } from '@/lib/queries';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = await params;

    try {
        const logs = await getInventoryLogsByPM(id);
        return Response.json(logs);
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
