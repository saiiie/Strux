// lib/inventory/addLogEntry.js

const addLogEntry = async (formData) => {
  const res = await fetch('/api/inventory_logs/log_entry/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  // 🔁 Read the body only once
  let responseBody;
  let jsonBody;

  try {
    responseBody = await res.text(); // Read as text first
    jsonBody = JSON.parse(responseBody); // Try parsing as JSON
  } catch (e) {
    // If parsing fails, just keep raw text
    jsonBody = null;
  }

  // Now use parsed body for both error and success handling
  if (!res.ok) {
    const errorMessage =
      (jsonBody && jsonBody.message) ||
      `HTTP error! status: ${res.status}`;

    console.error('Server response:', responseBody);
    throw new Error(errorMessage);
  }

  if (jsonBody === null) {
    console.error('Non-JSON response:', responseBody);
    throw new Error('Server returned non-JSON');
  }

  return jsonBody;
};

export default addLogEntry;