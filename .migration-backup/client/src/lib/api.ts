import axios from "axios"

// In development, Vite proxies /api to the Express server (see vite.config.ts).
// In production, set VITE_API_URL to the backend origin (e.g. https://api.example.com).
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api"

const client = axios.create({
  baseURL,
  withCredentials: true,
})

// Attach JWT (stored by the auth hook) on every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("rk_token")
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function normalizeError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)?.message
    return new Error(msg || err.message)
  }
  return err instanceof Error ? err : new Error("Request failed")
}

export const api = {
  async get<T>(url: string): Promise<T> {
    try {
      const res = await client.get<T>(url)
      return res.data
    } catch (err) {
      throw normalizeError(err)
    }
  },
  async post<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await client.post<T>(url, body)
      return res.data
    } catch (err) {
      throw normalizeError(err)
    }
  },
  async put<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await client.put<T>(url, body)
      return res.data
    } catch (err) {
      throw normalizeError(err)
    }
  },
  async patch<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await client.patch<T>(url, body)
      return res.data
    } catch (err) {
      throw normalizeError(err)
    }
  },
  async del<T>(url: string): Promise<T> {
    try {
      const res = await client.delete<T>(url)
      return res.data
    } catch (err) {
      throw normalizeError(err)
    }
  },
}

// Multipart upload helper. `field` is "images" (multiple) or "video" (single).
// Returns the array of secure Cloudinary URLs produced by the server.
export async function uploadFiles(url: string, files: File[], field: "images" | "video"): Promise<string[]> {
  const fd = new FormData()
  for (const file of files) fd.append(field, file)
  try {
    const res = await client.post<{ urls: string[] }>(url, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.urls
  } catch (err) {
    throw normalizeError(err)
  }
}

export interface Property {
  _id: string
  title: string
  buildingName?: string
  address?: string
  description: string
  price: number
  rooms: number
  baths: number
  areaSqft: number
  status: "available" | "reserved" | "sold"
  published: boolean
  images: string[]
  video?: string
  // GeoJSON polygon: coordinates[0] is a ring of [lng, lat] pairs
  area?: { type: "Polygon"; coordinates: number[][][] }
  marker?: { lat: number; lng: number }
  views: number
  createdAt: string
  updatedAt: string
}
