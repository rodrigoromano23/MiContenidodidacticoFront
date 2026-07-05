import { Mic } from "lucide-react";

export default function VoiceButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed
        bottom-8
        right-8
        p-5
        rounded-full
        shadow-xl
        transition
        ${
          active
            ? "bg-red-600 animate-pulse"
            : "bg-slate-800 hover:bg-slate-700"
        }
        text-white
      `}
    >
      <Mic size={28} />
    </button>
  );
}