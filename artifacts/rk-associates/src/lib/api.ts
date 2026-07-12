import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api"

const client = axios.create({
  baseURL,
  withCredentials: true,
})

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

export async function uploadFiles(
  url: string,
  files: File[],
  field: "images" | "video",
): Promise<string[]> {
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
  /** Human-readable area set by admin, e.g. "5 Marla", "1 Kanal" */
  areaText?: string
  status: "available" | "reserved" | "sold"
  published: boolean
  images: string[]
  video?: string
  area?: { type: "Polygon"; coordinates: number[][][] }
  marker?: { lat: number; lng: number }
  views: number
  createdAt: string
  updatedAt: string
}
