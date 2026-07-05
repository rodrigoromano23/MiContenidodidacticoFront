import { useEffect, useState } from "react";

export default function TypeWriter({
  text = "",
  speed = 20,
  className = "",
}) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");

    if (!text) return;

    let index = 0;

    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span
      className={`whitespace-pre-wrap leading-7 ${className}`}
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        textShadow: "none",
        border: "none",
      }}
    >
      {displayedText}
    </span>
  );
}