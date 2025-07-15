import { getInventoryLogsByPM } from '@/lib/queries';

export async function GET(
    request: Request,
    { params }: { params: { pmid: string } }
) {
    const { pmid } = await params;

    try {
        const logs = await getInventoryLogsByPM(pmid);
        return Response.json(logs);
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
