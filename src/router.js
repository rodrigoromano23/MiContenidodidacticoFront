import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Material from "./pages/Material/Material";
import Admin from "./pages/Admin/Admin";
import SuperAdmin from "./pages/SuperAdmin/SuperAdmin";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

export default function Router() {
  return (
    <Routes>

      {/* Vista pública */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      <Route
        path="/material/:id"
        element={
          <MainLayout>
            <Material />
          </MainLayout>
        }
      />

      {/* Administrador */}

      <Route
        path="/admin"
        element={
          <AdminLayout>
            <Admin />
          </AdminLayout>
        }
      />

      {/* Super Administrador */}

      <Route
        path="/superadmin"
        element={
          <SuperAdminLayout>
            <SuperAdmin />
          </SuperAdminLayout>
        }
      />

    </Routes>
  );
}