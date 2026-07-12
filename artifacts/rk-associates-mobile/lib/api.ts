const domain = process.env.EXPO_PUBLIC_DOMAIN;
const BASE_URL = domain ? `https://${domain}/api` : "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const json = await res.json();
      if (json?.message) message = json.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },
};

export interface Property {
  _id: string;
  title: string;
  buildingName?: string;
  address?: string;
  description: string;
  price: number;
  rooms: number;
  baths: number;
  areaSqft: number;
  status: "available" | "reserved" | "sold";
  published: boolean;
  images: string[];
  video?: string;
  marker?: { lat: number; lng: number };
  views: number;
  createdAt: string;
  updatedAt: string;
}
