export interface GenerateImagePayload {
  base64Image: string;
  mimeType: string;
  prompt: string;
  resolution: '1K' | '2K' | '4K';
}

const API_BASE =
  (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function generateImageViaApi(
  payload: GenerateImagePayload,
  token: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate image');
  }

  const data = (await res.json()) as { imageUrl: string };
  return data.imageUrl;
}
