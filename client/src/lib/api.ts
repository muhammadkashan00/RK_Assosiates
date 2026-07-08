import axios from "axios"

// In development, Vite proxies /api to the Express server (see vite.config.ts).
// In production, set VITE_API_URL to the Render backend origin (e.g. https://api.example.com).
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api"

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

export type Property = {
  _id: string
  title: string
  markdownDescription: string
  price: number
  areaSqft: number
  rooms: number
  baths: number
  buildingName: string
  images: string[]
  videos: string[]
  areaHighlight?: { type: "Polygon"; coordinates: number[][][] }
  areaLabel?: string
  tags: string[]
  status: "available" | "under-construction" | "sold"
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export const fetcher = (url: string) => api.get(url).then((r) => r.data)
