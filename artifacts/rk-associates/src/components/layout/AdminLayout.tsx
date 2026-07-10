import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const links = [
  {
    to: "/admin",
    label: "Dashboard",
    end: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/admin/properties",
    label: "Properties",
    end: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    to: "/admin/properties/new",
    label: "Add Property",
    end: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    to: "/admin/leads",
    label: "Leads",
    end: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
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
      {/* Mobile top bar */}
      <div className="lg:hidden border-b border-navy/10 bg-navy px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-serif text-lg font-bold text-gold">RK Admin</span>
          <span className="truncate max-w-[140px] text-xs text-beige/60">{user?.email}</span>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-gold text-navy"
                    : "text-beige/80 hover:bg-white/10 hover:text-beige"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "opacity-100" : "opacity-70"}>{l.icon}</span>
                  {l.label}
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-beige/60 hover:bg-white/10 hover:text-beige transition whitespace-nowrap"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </nav>
      </div>

      {/* Main layout */}
      <div className="mx-auto flex max-w-7xl lg:gap-6 lg:px-6 lg:py-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-8 rounded-2xl bg-navy overflow-hidden shadow-xl">
            {/* Brand */}
            <div className="px-5 pt-6 pb-4 border-b border-white/10">
              <p className="font-serif text-xl font-bold text-gold">RK Admin</p>
              <p className="mt-0.5 truncate text-xs text-beige/50">{user?.email}</p>
            </div>

            {/* Nav links */}
            <nav className="p-3 space-y-0.5">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-gold text-navy shadow-sm"
                        : "text-beige/75 hover:bg-white/10 hover:text-beige"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 ${isActive ? "opacity-100" : "opacity-60"}`}>
                        {l.icon}
                      </span>
                      <span>{l.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-3 pt-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-beige/60 transition hover:bg-white/10 hover:text-beige"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Page content */}
        <main className="min-w-0 flex-1 px-4 py-5 lg:px-0 lg:py-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
