const addAccount =  async (formData) => {
    const res = await fetch('/api/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        });

    const data = await res.json();
    return data;
}

export default addAccount;