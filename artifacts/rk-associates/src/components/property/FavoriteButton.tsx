import { useFavorites } from "../../context/FavoritesContext"

export function FavoriteButton({
  propertyId,
  className = "",
  size = 18,
}: {
  propertyId: string
  className?: string
  size?: number
}) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(propertyId)
  const base =
    className ||
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-navy/5 transition dark:bg-navy-light/90 dark:ring-white/10"

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(propertyId)
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      className={`${base} ${active ? "!text-rose-500" : ""}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    </button>
  )
}
