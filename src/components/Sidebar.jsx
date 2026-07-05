import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900 text-white min-h-screen p-6">

      <h2 className="text-2xl font-bold mb-8">

        Biblioteca

      </h2>

      <nav className="space-y-3">

        <Link
          to="/admin"
          className="block hover:bg-slate-800 rounded-lg p-3"
        >
          Dashboard
        </Link>

        <Link
          to="/admin/publicaciones"
          className="block hover:bg-slate-800 rounded-lg p-3"
        >
          Publicaciones
        </Link>

        <Link
          to="/admin/usuarios"
          className="block hover:bg-slate-800 rounded-lg p-3"
        >
          Usuarios
        </Link>

      </nav>

    </aside>
  );
}