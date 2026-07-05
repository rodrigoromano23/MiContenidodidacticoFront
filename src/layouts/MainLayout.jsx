export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      
      {/* Header */}
      <header className="bg-blue-700 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
          <h1 className="text-2xl font-bold text-white">
            Biblioteca Digital
          </h1>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-8 text-white">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-center text-white py-4">
        © {new Date().getFullYear()} Biblioteca Digital
      </footer>

    </div>
  );
}