import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api, type Property } from "../lib/api"
import { AreaMap } from "../components/map/AreaMap"
import { WhatsAppInquiry } from "../components/property/WhatsAppInquiry"
import { PropertyGrid } from "../components/property/PropertyGrid"
import { formatPrice, formatNumber, statusLabels, statusStyles } from "../lib/format"

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [related, setRelated] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    api
      .get<{ property: Property; related: Property[] }>(`/properties/${id}`)
      .then((res) => {
        setProperty(res.property)
        setRelated(res.related ?? [])
        setActiveImage(0)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-96 w-full animate-pulse rounded-2xl bg-slate/10" />
      </div>
    )
  }

  if (notFound || !property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-navy">Property not found</h1>
        <p className="mt-2 text-slate/70">It may have been removed or is no longer available.</p>
        <Link to="/listings" className="mt-6 inline-block rounded-xl bg-navy px-6 py-3 font-semibold text-beige">
          Back to listings
        </Link>
      </div>
    )
  }

  const cover = property.images[activeImage] ?? property.images[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-slate/60">
        <Link to="/" className="hover:text-navy">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/listings" className="hover:text-navy">Listings</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-slate/10 ring-1 ring-navy/5">
            {cover ? (
              <img src={cover} alt={property.title} className="aspect-[16/10] w-full object-cover" crossOrigin="anonymous" />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-slate/40">No image</div>
            )}
          </div>
          {property.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {property.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                    i === activeImage ? "ring-gold" : "ring-transparent hover:ring-slate/30"
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="h-full w-full object-cover" crossOrigin="anonymous" />
                </button>
              ))}
            </div>
          )}

          {property.video && (
            <div className="mt-6">
              <h2 className="mb-3 font-serif text-xl font-semibold text-navy">Video Tour</h2>
              <video src={property.video} controls className="w-full rounded-2xl ring-1 ring-navy/10" />
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-3 font-serif text-xl font-semibold text-navy">Coverage Area</h2>
            <AreaMap
              ring={property.area?.coordinates?.[0]}
              center={property.marker}
              title={property.title}
            />
          </div>

          <div className="mt-8">
            <h2 className="mb-3 font-serif text-xl font-semibold text-navy">Description</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate/80">{property.description}</p>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-card ring-1 ring-navy/5">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[property.status]}`}>
              {statusLabels[property.status]}
            </span>
            <h1 className="mt-3 font-serif text-2xl font-bold text-navy">{property.title}</h1>
            {property.buildingName && <p className="mt-1 text-slate/70">{property.buildingName}</p>}
            {property.address && <p className="mt-1 text-sm text-slate/60">{property.address}</p>}

            <p className="mt-4 font-serif text-3xl font-bold text-gold-dark">{formatPrice(property.price)}</p>

            <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-slate/10 py-4 text-center">
              <div>
                <dt className="text-xs text-slate/60">Rooms</dt>
                <dd className="font-serif text-lg font-semibold text-navy">{formatNumber(property.rooms)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate/60">Baths</dt>
                <dd className="font-serif text-lg font-semibold text-navy">{formatNumber(property.baths)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate/60">Area</dt>
                <dd className="font-serif text-lg font-semibold text-navy">{formatNumber(property.areaSqft)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <WhatsAppInquiry propertyId={property._id} propertyTitle={property.title} />
            </div>
            <p className="mt-3 text-center text-xs text-slate/50">
              {formatNumber(property.views)} views
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-serif text-2xl font-bold text-navy">Nearby Properties</h2>
          <PropertyGrid properties={related} />
        </section>
      )}
    </div>
  )
}
