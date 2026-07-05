import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Admin from "../pages/Admin";
import SuperAdmin from "../pages/SuperAdmin";

export default function AppRouter() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/admin"
        element={<Admin />}
      />

      <Route
        path="/superadmin"
        element={<SuperAdmin />}
      />

    </Routes>
  );
}