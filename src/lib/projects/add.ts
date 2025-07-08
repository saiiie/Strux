const addProject =  async (formData) => {
    const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        });

    const data = await res.json();
    return data;
}

export default addProject;