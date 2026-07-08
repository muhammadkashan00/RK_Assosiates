import { Routes, Route } from "react-router-dom"
import { PublicLayout } from "./components/layout/PublicLayout"
import { AdminLayout } from "./components/layout/AdminLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Listings from "./pages/Listings"
import PropertyDetail from "./pages/PropertyDetail"
import NotFound from "./pages/NotFound"
import Login from "./pages/admin/Login"
import Dashboard from "./pages/admin/Dashboard"
import Properties from "./pages/admin/Properties"
import PropertyForm from "./pages/admin/PropertyForm"
import Leads from "./pages/admin/Leads"

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/properties" element={<Properties />} />
        <Route path="/admin/properties/new" element={<PropertyForm />} />
        <Route path="/admin/properties/:id/edit" element={<PropertyForm />} />
        <Route path="/admin/leads" element={<Leads />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
