import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/properties/new", label: "Add Property" },
  { to: "/admin/leads", label: "Leads" },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen bg-beige">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-60 lg:flex-shrink-0">
          <div className="rounded-2xl bg-navy p-5 text-beige lg:sticky lg:top-6">
            <div className="mb-6">
              <p className="font-serif text-xl font-bold text-gold-light">RK Admin</p>
              <p className="mt-0.5 truncate text-xs text-beige/60">{user?.email}</p>
            </div>
            <nav className="flex flex-row gap-1 lg:flex-col">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive ? "bg-gold text-navy" : "text-beige/80 hover:bg-white/10"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="mt-6 w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-beige/80 transition hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
