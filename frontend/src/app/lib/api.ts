export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    let message = `API Error: ${response.status}`;

    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "detail" in body) {
        const detail = body.detail;
        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          const validationMessages = detail.flatMap((item) => {
            if (typeof item !== "object" || item === null || !("msg" in item)) {
              return [];
            }

            const field =
              "loc" in item && Array.isArray(item.loc)
                ? item.loc.slice(1).join(".")
                : "";
            const description =
              typeof item.msg === "string" ? item.msg : "Invalid value";

            return [field ? `${field}: ${description}` : description];
          });

          if (validationMessages.length > 0) {
            message = validationMessages.join("; ");
          }
        }
      }
    } catch {
      // Keep the HTTP status message when the response has no JSON body.
    }

    throw new ApiRequestError(response.status, message);
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