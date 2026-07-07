const BASE_URL = "https://micontenidodidactico.onrender.com/api/materials";


// ======================
// 📥 GET TODOS / SEARCH
// ======================
export const getMaterials = async (q = "") => {
  const url = q ? `${BASE_URL}?q=${q}` : BASE_URL;

  const res = await fetch(url);
  return res.json();
};


// ======================
// ➕ CREATE MATERIAL
// ======================
export const createMaterial = async (data) => {
  const formData = new FormData();

  formData.append("titulo", data.titulo);
  formData.append("contenido", data.contenido);
  formData.append("docente", data.docente);

  if (data.image) {
    formData.append("image", data.image);
  }

  const res = await fetch(BASE_URL, {
    method: "POST",
    body: formData,
  });

  return res.json();
};


// ======================
// ✏️ UPDATE MATERIAL
// ======================
export const updateMaterial = async (id, data) => {
  const formData = new FormData();

  formData.append("titulo", data.titulo);
  formData.append("contenido", data.contenido);
  formData.append("docente", data.docente);

  if (data.image) {
    formData.append("image", data.image);
  }

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  return res.json();
};


// ======================
// 🗑 DELETE MATERIAL
// ======================
export const deleteMaterial = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  return res.json();
};