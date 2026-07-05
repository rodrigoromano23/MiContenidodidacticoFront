import { useState } from "react";

export default function ImageViewer({ src }) {
  const [visible, setVisible] = useState(false);
  const [zoom, setZoom] = useState(1);

  return (
    <>
      {/* IMAGEN */}
      {visible && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <img
            src={src}
            alt="viewer"
            style={{ transform: `scale(${zoom})` }}
            className="transition duration-300 max-h-[90vh]"
          />
        </div>
      )}
    </>
  );
}