export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}