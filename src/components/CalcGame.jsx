import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

// 1. Función para generar números aleatorios
function rand(n) {
  return Math.floor(Math.random() * n);
}

// 2. Función para convertir lo que habla el usuario ("doce", "quince") a un Number real
function textoANumero(texto) {
  if (typeof texto === "number") return texto;
  if (!texto) return null;

  const limpio = texto.toString().trim().toLowerCase();

  // Si ya es un dígito ("12")
  if (!isNaN(parseInt(limpio))) return parseInt(limpio);

  const numeros = {
    cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
    seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11,
    doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16,
    diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20,
    veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24,
    veinticinco: 25, treinta: 30, cuarenta: 40, cincuenta: 50
  };

  return numeros[limpio] !== undefined ? numeros[limpio] : null;
}

export default function CalcGame({ calcLevel = 1, setCalcLevel }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [correct, setCorrect] = useState(null);

  const [score, setScore] = useState(0);
  const [time, setTime] = useState(15);
  const [progress, setProgress] = useState(100);

  const [feedback, setFeedback] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Mantener la referencia actualizada de la respuesta correcta y del handler
  const correctRef = useRef(correct);
  const handleAnswerRef = useRef();

  const generate = () => {
    let a, b, op, result;

    if (calcLevel === 1) {
      a = rand(20); b = rand(20);
      op = "+";
      result = a + b;
    }

    if (calcLevel === 2) {
      a = rand(30); b = rand(20);
      op = "-";
      result = a - b;
    }

    if (calcLevel === 3) {
      a = rand(12); b = rand(12);
      op = "×";
      result = a * b;
    }

    if (calcLevel === 4) {
      b = rand(10) + 1;
      result = rand(10);
      a = result * b;
      op = "÷";
    }

    const opts = new Set([result]);
    while (opts.size < 4) {
      opts.add(result + rand(10) - 5);
    }

    const shuffled = [...opts].sort(() => Math.random() - 0.5);

    setQuestion(`${a} ${op} ${b} = ?`);
    setOptions(shuffled);
    setCorrect(result);

    setTime(15);
    setProgress(100);
    setFeedback("");
    setSuccessMsg("");
  };

  useEffect(() => {
    generate();
  }, [calcLevel]);

  useEffect(() => {
    if (time <= 0) {
      setFeedback("⏱ Tiempo agotado");
      generate();
      return;
    }

    const t = setTimeout(() => {
      setTime((s) => s - 1);
      setProgress((p) => p - 6.6);
    }, 1000);

    return () => clearTimeout(t);
  }, [time]);

  const handleAnswer = (opt) => {
    if (opt === correctRef.current) {
      setSuccessMsg("✔ Bien...!");

      const gain = Math.floor(Math.random() * 3) + 1;
      const newScore = score + gain;
      setScore(newScore);

      const newLevel = Math.floor(newScore / 500) + 1;
      if (newLevel !== calcLevel && newLevel <= 4) {
        setCalcLevel(newLevel);

        Swal.fire({
          icon: "success",
          title: `Nivel ${newLevel} desbloqueado`,
          timer: 1200,
          showConfirmButton: false,
        });
      }

      setTimeout(generate, 600);
    } else {
      setSuccessMsg("");
      setFeedback("❌ Le Erraste!");
      setTimeout(generate, 900);
    }
  };

  // Guardar las referencias más recientes
  useEffect(() => {
    correctRef.current = correct;
    handleAnswerRef.current = handleAnswer;
  });

  /* ---------------- 🎙️ ESCUCHADOR DE COMANDOS DE VOZ EN EL JUEGO ---------------- */
  useEffect(() => {
    const manejarRespuestaVoz = (e) => {
      const rawRespuesta = e.detail?.respuesta;

      if (rawRespuesta !== undefined && rawRespuesta !== null) {
        const numero = textoANumero(rawRespuesta);
        console.log("🎮 Respuesta de voz recibida:", rawRespuesta, "-> Convertido:", numero);

        if (numero !== null && handleAnswerRef.current) {
          handleAnswerRef.current(numero);
        }
      }
    };

    window.addEventListener("voz-respuesta-matematica", manejarRespuestaVoz);
    return () => window.removeEventListener("voz-respuesta-matematica", manejarRespuestaVoz);
  }, []);

  const crowns = score >= 1000 ? 1 + Math.floor((score - 1000) / 1200) : 0;

  return (
    <div className="space-y-5 text-white">
      <div className="flex justify-between items-center">
        <div className="text-lg flex gap-2 items-center">
          Puntaje: {score}
          {successMsg && (
            <span className="text-green-400 animate-pulse text-sm">
              {successMsg}
            </span>
          )}
        </div>

        <div className="text-xl">
          {"👑".repeat(crowns)}
        </div>
      </div>

      <div className="text-cyan-300">
        Nivel: {
          calcLevel === 1 ? "Sumas" :
          calcLevel === 2 ? "Restas" :
          calcLevel === 3 ? "Multiplicación" :
          "División"
        }
      </div>

      <div className="text-2xl font-bold text-center">
        {question}
      </div>

      <div className="flex justify-center gap-4">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="
              w-14 h-14 rounded-full
              border border-white
              bg-white/5
              text-white text-sm
              hover:bg-cyan-500/30
              transition
              flex items-center justify-center
            "
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center mt-6">
        <div className="relative w-28 h-28 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          <svg className="w-full h-full rotate-[-90deg]">
            <circle
              cx="50%"
              cy="50%"
              r="40"
              stroke="white"
              strokeWidth="4"
              fill="transparent"
              opacity="0.2"
            />
            <circle
              cx="50%"
              cy="50%"
              r="40"
              stroke="#22d3ee"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={251}
              strokeDashoffset={(progress / 100) * 251}
              className="transition-all duration-1000"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
            {time}
          </div>
        </div>

        {feedback && (
          <div className="mt-2 text-red-400 text-sm animate-pulse">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}