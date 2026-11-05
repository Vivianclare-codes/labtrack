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

export async function apiRequestAll<T>(endpoint: string): Promise<T[]> {
  const separator = endpoint.includes("?") ? "&" : "?";
  const pageSize = 100;
  const records: T[] = [];
  let skip = 0;

  while (true) {
    const page: T[] = await apiRequest(
      `${endpoint}${separator}skip=${skip}&limit=${pageSize}`
    );

    records.push(...page);

    if (page.length < pageSize) {
      return records;
    }

    skip += page.length;
  }
}