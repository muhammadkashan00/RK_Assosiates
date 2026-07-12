import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { api, uploadFiles, type Property } from "../../lib/api"
import { DrawMap } from "../../components/map/DrawMap"

// ─── Upload limits (must match backend upload.ts) ────────────────────────────
const IMAGE_MAX_MB = 20
const VIDEO_MAX_MB = 100
const IMAGE_COMPRESS_THRESHOLD_MB = 2   // auto-compressed above this
const VIDEO_COMPRESS_THRESHOLD_MB = 10  // auto-compressed above this

function formatMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1) + " MB"
}

function validateImageFiles(files: File[]): string | null {
  for (const f of files) {
    const mb = f.size / 1024 / 1024
    if (mb > IMAGE_MAX_MB) {
      return `"${f.name}" is ${mb.toFixed(1)} MB — images must be under ${IMAGE_MAX_MB} MB. Please resize it and try again.`
    }
  }
  return null
}

function validateVideoFile(file: File): string | null {
  const mb = file.size / 1024 / 1024
  if (mb > VIDEO_MAX_MB) {
    return `"${file.name}" is ${mb.toFixed(1)} MB — videos must be under ${VIDEO_MAX_MB} MB.`
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────

interface FormState {
  title: string
  buildingName: string
  address: string
  description: string
  price: string
  rooms: string
  baths: string
  areaSqft: string
  status: Property["status"]
  published: boolean
}

const empty: FormState = {
  title: "",
  buildingName: "",
  address: "",
  description: "",
  price: "",
  rooms: "",
  baths: "",
  areaSqft: "",
  status: "available",
  published: true,
}

const DRAFT_KEY = "rk_property_draft"

function loadDraft(): { form: FormState; ring: number[][]; marker: { lat: number; lng: number } | null } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveDraft(form: FormState, ring: number[][], marker: { lat: number; lng: number } | null) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, ring, marker }))
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
}

const inputClass =
  "w-full rounded-lg border border-slate/20 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"

function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tab, setTab] = useState<"write" | "preview">("write")
  const tabCls = (t: "write" | "preview") =>
    `px-4 py-1.5 text-xs font-semibold rounded-md transition ${
      tab === t ? "bg-gold text-navy" : "text-slate/60 hover:text-navy hover:bg-slate/5"
    }`
  return (
    <div className="sm:col-span-2">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-slate/70">Description (Markdown)</label>
        <div className="flex gap-1 rounded-lg border border-slate/15 bg-slate/5 p-0.5">
          <button type="button" className={tabCls("write")} onClick={() => setTab("write")}>Write</button>
          <button type="button" className={tabCls("preview")} onClick={() => setTab("preview")}>Preview</button>
        </div>
      </div>
      {tab === "write" ? (
        <textarea
          rows={7}
          className={inputClass + " font-mono text-xs leading-relaxed"}
          placeholder={"## Overview\n\nDescribe the property...\n\n**Bold**, *italic*, - bullet points"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="prose-rk min-h-28 rounded-lg border border-slate/20 bg-slate/3 px-3 py-2 text-sm text-slate/80">
          {value ? <ReactMarkdown>{value}</ReactMarkdown> : <span className="text-slate/40 italic">Nothing to preview yet.</span>}
        </div>
      )}
      <p className="mt-1 text-[11px] text-slate/40">Supports **bold**, *italic*, ## headings, - lists</p>
    </div>
  )
}

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>()
  const editing = Boolean(id)
  const navigate = useNavigate()

  const draft = !editing ? loadDraft() : null

  const [form, setForm] = useState<FormState>(draft?.form ?? empty)
  const [images, setImages] = useState<string[]>([])
  const [video, setVideo] = useState<string>("")
  const [ring, setRing] = useState<number[][]>(draft?.ring ?? [])
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(draft?.marker ?? null)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [draftSaved, setDraftSaved] = useState(false)

  // Track pending upload sizes to show compression notices
  const [pendingImageBytes, setPendingImageBytes] = useState<number>(0)
  const [pendingVideoBytes, setPendingVideoBytes] = useState<number>(0)

  const imgInput = useRef<HTMLInputElement>(null)
  const vidInput = useRef<HTMLInputElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!editing || !id) return
    api
      .get<{ property: Property }>(`/properties/${id}?admin=1`)
      .then((res) => {
        const p = res.property
        setForm({
          title: p.title,
          buildingName: p.buildingName ?? "",
          address: p.address ?? "",
          description: p.description ?? "",
          price: String(p.price ?? ""),
          rooms: String(p.rooms ?? ""),
          baths: String(p.baths ?? ""),
          areaSqft: String(p.areaSqft ?? ""),
          status: p.status,
          published: p.published,
        })
        setImages(p.images ?? [])
        setVideo(p.video ?? "")
        setRing(p.area?.coordinates?.[0] ?? [])
        setMarker(p.marker ?? null)
      })
      .catch(() => setError("Could not load property"))
      .finally(() => setLoading(false))
  }, [editing, id])

  useEffect(() => {
    if (editing) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveDraft(form, ring, marker)
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 1500)
    }, 800)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [form, ring, marker, editing])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)

    // Client-side size validation
    const validationError = validateImageFiles(files)
    if (validationError) {
      setUploadError(validationError)
      if (imgInput.current) imgInput.current.value = ""
      return
    }

    setUploadError("")
    setUploading(true)
    setError("")

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0)
    setPendingImageBytes(totalBytes)

    try {
      const urls = await uploadFiles("/properties/upload", files, "images")
      setImages((prev) => [...prev, ...urls])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setPendingImageBytes(0)
      if (imgInput.current) imgInput.current.value = ""
    }
  }

  async function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const file = e.target.files[0]

    // Client-side size validation
    const validationError = validateVideoFile(file)
    if (validationError) {
      setUploadError(validationError)
      if (vidInput.current) vidInput.current.value = ""
      return
    }

    setUploadError("")
    setUploading(true)
    setError("")
    setPendingVideoBytes(file.size)

    try {
      const urls = await uploadFiles("/properties/upload", [file], "video")
      setVideo(urls[0] ?? "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setPendingVideoBytes(0)
      if (vidInput.current) vidInput.current.value = ""
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (ring.length < 3) {
      setError("Draw the property coverage area on the map (at least 3 points).")
      return
    }
    setSaving(true)
    const centroid = marker ?? {
      lat: ring.reduce((s, p) => s + p[1], 0) / ring.length,
      lng: ring.reduce((s, p) => s + p[0], 0) / ring.length,
    }
    const closed = [...ring]
    if (
      closed.length &&
      (closed[0][0] !== closed[closed.length - 1][0] ||
        closed[0][1] !== closed[closed.length - 1][1])
    ) {
      closed.push(closed[0])
    }
    const payload = {
      ...form,
      price: Number(form.price),
      rooms: Number(form.rooms),
      baths: Number(form.baths),
      areaSqft: Number(form.areaSqft),
      images,
      video,
      marker: centroid,
      area: { type: "Polygon", coordinates: [closed] },
    }
    try {
      if (editing && id) {
        await api.put(`/properties/${id}`, payload)
      } else {
        await api.post("/properties", payload)
        clearDraft()
      }
      navigate("/admin/properties")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  function discardDraft() {
    clearDraft()
    setForm(empty)
    setRing([])
    setMarker(null)
  }

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-white/60" />

  const imageWillCompress = pendingImageBytes > IMAGE_COMPRESS_THRESHOLD_MB * 1024 * 1024
  const videoWillCompress = pendingVideoBytes > VIDEO_COMPRESS_THRESHOLD_MB * 1024 * 1024

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">
            {editing ? "Edit Property" : "Add Property"}
          </h1>
          {!editing && draft && (
            <p className="mt-0.5 text-xs text-slate/50">
              Draft restored —{" "}
              <button type="button" onClick={discardDraft} className="text-red-500 hover:underline">
                discard
              </button>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!editing && draftSaved && (
            <span className="flex items-center gap-1 text-xs text-slate/50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Draft saved
            </span>
          )}
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-xl bg-navy px-6 py-2.5 font-semibold text-beige transition hover:bg-navy-light disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Property"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Upload validation error — separate from general form error */}
      {uploadError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 ring-1 ring-red-200">
          <svg className="mt-0.5 shrink-0 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">File too large</p>
            <p className="text-xs text-red-600">{uploadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadError("")}
            className="ml-auto shrink-0 text-red-400 hover:text-red-600"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5">
            <h2 className="mb-4 font-serif text-lg font-semibold text-navy">Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate/70">Title *</label>
                <input
                  required
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">
                  Building / Project name
                </label>
                <input
                  className={inputClass}
                  value={form.buildingName}
                  onChange={(e) => set("buildingName", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">Address</label>
                <input
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">
                  Price (PKR) *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">Status</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as Property["status"])}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">Rooms</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.rooms}
                  onChange={(e) => set("rooms", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">Baths</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.baths}
                  onChange={(e) => set("baths", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">Area (sqft)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.areaSqft}
                  onChange={(e) => set("areaSqft", e.target.value)}
                />
              </div>
              <MarkdownEditor
                value={form.description}
                onChange={(v) => set("description", v)}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5">
            <h2 className="mb-1 font-serif text-lg font-semibold text-navy">Coverage Area *</h2>
            <p className="mb-3 text-sm text-slate/60">
              Click the map to outline the property boundary. The marker is auto-placed at the center.
            </p>
            <DrawMap points={ring} onChange={setRing} center={marker ?? undefined} />
          </div>
        </div>

        <div className="space-y-4">
          {/* ── Images ── */}
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-serif text-lg font-semibold text-navy">Images</h2>
              <span className="text-[11px] text-slate/50">Max {IMAGE_MAX_MB} MB each</span>
            </div>

            <input
              ref={imgInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => { setUploadError(""); imgInput.current?.click() }}
              disabled={uploading}
              className="w-full rounded-lg border border-dashed border-slate/30 py-3 text-sm font-medium text-slate transition hover:bg-slate/5 disabled:opacity-60"
            >
              {uploading && pendingImageBytes > 0 ? "Uploading…" : "+ Upload images"}
            </button>

            {/* Compression notice while uploading */}
            {uploading && pendingImageBytes > 0 && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-2">
                <svg className="animate-spin text-gold" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="56" strokeDashoffset="14" />
                </svg>
                <span className="text-xs text-navy/80">
                  Uploading {formatMB(pendingImageBytes)}
                  {imageWillCompress && " — auto-compressing for web"}
                  …
                </span>
              </div>
            )}

            {/* Hint about auto-compression */}
            <p className="mt-1.5 text-[11px] text-slate/40">
              Images over {IMAGE_COMPRESS_THRESHOLD_MB} MB are automatically compressed and optimised for web.
            </p>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-slate/10"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-1 top-1 rounded-full bg-navy/80 p-1 text-beige opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Video ── */}
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-serif text-lg font-semibold text-navy">Video Tour</h2>
              <span className="text-[11px] text-slate/50">Max {VIDEO_MAX_MB} MB</span>
            </div>

            <input
              ref={vidInput}
              type="file"
              accept="video/*"
              onChange={handleVideo}
              className="hidden"
            />

            {video ? (
              <div className="space-y-2">
                <video src={video} controls className="w-full rounded-lg" />
                <button
                  type="button"
                  onClick={() => setVideo("")}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Remove video
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setUploadError(""); vidInput.current?.click() }}
                  disabled={uploading}
                  className="w-full rounded-lg border border-dashed border-slate/30 py-3 text-sm font-medium text-slate transition hover:bg-slate/5 disabled:opacity-60"
                >
                  {uploading && pendingVideoBytes > 0 ? "Uploading…" : "+ Upload video"}
                </button>

                {/* Compression notice while uploading */}
                {uploading && pendingVideoBytes > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-2">
                    <svg className="animate-spin text-gold" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="56" strokeDashoffset="14" />
                    </svg>
                    <span className="text-xs text-navy/80">
                      Uploading {formatMB(pendingVideoBytes)}
                      {videoWillCompress && " — auto-compressing video"}
                      …
                    </span>
                  </div>
                )}

                <p className="mt-1.5 text-[11px] text-slate/40">
                  Videos over {VIDEO_COMPRESS_THRESHOLD_MB} MB are automatically compressed. Accepts MP4, MOV, WebM.
                </p>
              </>
            )}
          </div>

          {/* ── Publish ── */}
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 rounded border-slate/30 text-navy focus:ring-gold"
              />
              <span className="text-sm font-medium text-navy">
                Publish immediately (visible on public site)
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  )
}
