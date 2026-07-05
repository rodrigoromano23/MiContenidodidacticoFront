import {
    Play,
    Pause,
    Square,
    Volume2
} from "lucide-react";

export default function SpeechControls({

    onSpeak,
    onPause,
    onResume,
    onStop

}) {

    return (

        <div className="space-y-6">

            <div>

                <h2 className="text-white text-xl font-semibold flex items-center gap-2">

                    <Volume2 size={22} />

                    Narrador

                </h2>

                <p className="text-gray-400 text-sm mt-2">
                    Escucha el contenido del material mediante síntesis de voz.
                </p>

            </div>

            <div className="grid grid-cols-2 gap-3">

                <button
                    onClick={onSpeak}
                    className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 text-white hover:bg-cyan-700 transition"
                >
                    <Play size={18} />

                    Escuchar
                </button>

                <button
                    onClick={onPause}
                    className="flex items-center justify-center gap-2 rounded-lg bg-yellow-500 py-3 text-white hover:bg-yellow-600 transition"
                >
                    <Pause size={18} />

                    Pausar
                </button>

                <button
                    onClick={onResume}
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-white hover:bg-green-700 transition"
                >
                    <Play size={18} />

                    Continuar
                </button>

                <button
                    onClick={onStop}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-white hover:bg-red-700 transition"
                >
                    <Square size={18} />

                    Detener
                </button>

            </div>

        </div>

    );

}