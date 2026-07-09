import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { LocationPrompt } from "../LocationPrompt"
import { useVisitTracker } from "../../hooks/useVisitTracker"

export function PublicLayout() {
  useVisitTracker()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LocationPrompt />
    </div>
  )
}
