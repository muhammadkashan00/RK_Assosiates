import { Routes, Route } from "react-router-dom"
import { PublicLayout } from "./components/layout/PublicLayout"
import { Home } from "./pages/Home"
import { PropertyDetail } from "./pages/PropertyDetail"
import { NotFound } from "./pages/NotFound"
import { Login } from "./pages/admin/Login"
import { AdminLayout } from "./pages/admin/AdminLayout"
import { Dashboard } from "./pages/admin/Dashboard"
import { PropertiesList } from "./pages/admin/PropertiesList"
import { PropertyForm } from "./pages/admin/PropertyForm"
import { Leads } from "./pages/admin/Leads"
import { ProtectedRoute } from "./components/ProtectedRoute"

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="properties" element={<PropertiesList />} />
        <Route path="properties/new" element={<PropertyForm />} />
        <Route path="properties/:id" element={<PropertyForm />} />
        <Route path="leads" element={<Leads />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
