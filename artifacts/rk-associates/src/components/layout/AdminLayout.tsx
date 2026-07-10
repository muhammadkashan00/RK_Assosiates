import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const links = [
  { to: "/admin", label: "Dashboard", end: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to: "/admin/properties", label: "Properties", end: true, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { to: "/admin/properties/new", label: "Add Property", end: false, icon: "M12 4v16m8-8H4" },
  { to: "/admin/leads", label: "Leads", end: false, icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
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
              <p className="font-serif text-xl font-bold text-gold">RK Admin</p>
              <p className="mt-0.5 truncate text-xs text-beige/60">{user?.email}</p>
            </div>
            <nav className="flex flex-row gap-1 lg:flex-col">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-gold text-navy shadow-sm"
                        : "text-beige/80 hover:bg-white/10 hover:text-beige"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={isActive ? "opacity-100" : "opacity-70"}
                      >
                        <path d={l.icon} />
                      </svg>
                      <span className="hidden lg:inline">{l.label}</span>
                      <span className="lg:hidden">{l.label.split(" ")[0]}</span>
                    </>
                  )}
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
