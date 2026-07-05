import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getMaterialById } from "../../services/api";
import Loader from "../../components/Loader/Loader";

export default function Material() {
  const { id } = useParams();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMaterialById(id);
      setMaterial(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el material");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
      </div>
    );

  if (!material) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-6">

      {/* TÍTULO */}
      <h1 className="text-4xl font-bold text-slate-800">
        {material.titulo}
      </h1>

      {/* DESCRIPCIÓN */}
      <p className="text-gray-600 text-lg">
        {material.descripcion}
      </p>

      {/* AUTOR / INFO */}
      <div className="text-sm text-gray-400 border-b pb-4">
        Publicado por: {material.autor || "Docente"} •{" "}
        {new Date(material.createdAt || Date.now()).toLocaleDateString()}
      </div>

      {/* CONTENIDO */}

      <div className="space-y-6 text-gray-800 leading-relaxed">

        {material.contenido?.map((block, index) => (
          <div key={index}>

            {/* TEXTO */}
            {block.type === "text" && (
              <p className="text-lg whitespace-pre-line">
                {block.value}
              </p>
            )}

            {/* IMAGEN / GIF */}
            {block.type === "image" && (
              <img
                src={block.value}
                alt="material"
                className="w-full rounded-xl shadow-md"
              />
            )}

          </div>
        ))}

      </div>

    </div>
  );
}