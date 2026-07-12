import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { BottomNav } from "./BottomNav"
import { LocationPrompt } from "../LocationPrompt"
import { useVisitTracker } from "../../hooks/useVisitTracker"

export function PublicLayout() {
  useVisitTracker()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <LocationPrompt />
    </div>
  )
}
