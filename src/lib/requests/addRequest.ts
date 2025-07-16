const addRequest = async (projectId: string, entries: any[]) => {
    const res = await fetch(`/api/material_requests/pm/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
    });

    const data = await res.json();
    return data;
};

export default addRequest;