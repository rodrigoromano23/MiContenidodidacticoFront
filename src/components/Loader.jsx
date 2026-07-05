import { useEffect, useState } from "react";

export default function Loader() {
  const [progress, setProgress] = useState(0);

  // Animación de la barra de progreso simulando la carga en 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.25; // Sube gradualmente hasta llegar a 100 en ~8s
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none">
      
      {/* 🌌 EFECTO DE FONDO: Destellos educativos futuristas */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_65%)] animate-pulse duration-[4000ms]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-bounce duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-bounce duration-[10000ms]" />

      {/* 📚 CONTENEDOR CENTRAL */}
      <div className="relative text-center max-w-xl px-6 space-y-8 z-10">
        
        {/* LOGO SIMBÓLICO ANIMADO */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(56,189,248,0.2)] animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-4xl">
              📖
            </div>
            {/* Órbita brillante alrededor del logo */}
            <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-2xl animate-ping opacity-25" />
          </div>
        </div>

        {/* TÍTULO CON TIPOGRAFÍA DE IMPACTO */}
        <div className="space-y-2">
          <h1 
            className="text-4xl md:text-5xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-indigo-200 uppercase drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            style={{ fontFamily: "'Arial Black', Gadget, sans-serif" }}
          >
            Mi Contenido Didáctico
          </h1>
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-cyan-400/70">
            Plataforma Inteligente de Aprendizaje
          </p>
        </div>

        {/* ⚡ BARRA DE PROGRESO */}
        <div className="space-y-2 max-w-xs mx-auto pt-4">
          <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono tracking-widest text-slate-500">
            <span>SISTEMA INICIANDO</span>
            <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
          </div>
        </div>

      </div>

      {/* MARCOS DECORATIVOS TECNOLÓGICOS */}
      <div className="absolute top-6 left-6 text-xs font-mono text-slate-700 select-none hidden md:block">SYS_INIT // CORE_V2.0.26</div>
      <div className="absolute bottom-6 right-6 text-xs font-mono text-slate-700 select-none hidden md:block">READY TO LEARN_</div>
    </div>
  );
}