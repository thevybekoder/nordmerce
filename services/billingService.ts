const API_BASE =
  (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function createCheckoutSession(token: string, quantity = 10) {
  const res = await fetch(`${API_BASE}/api/billing/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to start checkout');
  }

  if (data.url) {
    window.location.href = data.url;
  }
}


