export default function SuperAdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">

      <aside className="w-72 bg-indigo-900 text-white shadow-lg">

        <div className="p-6 border-b border-indigo-700">

          <h2 className="text-2xl font-bold">

            Super Administrador

          </h2>

        </div>

        <nav className="p-5 space-y-3">

          <button className="w-full text-left p-3 rounded-lg hover:bg-indigo-800">

            Usuarios

          </button>

          <button className="w-full text-left p-3 rounded-lg hover:bg-indigo-800">

            Administradores

          </button>

          <button className="w-full text-left p-3 rounded-lg hover:bg-indigo-800">

            Estadísticas

          </button>

        </nav>

      </aside>

      <main className="flex-1 p-10">

        {children}

      </main>

    </div>
  );
}