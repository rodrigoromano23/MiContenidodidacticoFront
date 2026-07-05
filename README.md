# EduVoice - Asistente Web de Innovación Educativa, Accesibilidad y Control por Voz

EduVoice es una plataforma web full-stack diseñada para transformar las aulas mediante el uso de tecnología simple (una computadora y un proyector). Permite a los docentes cargar contenidos dinámicos, utilizar síntesis de voz para mitigar barreras de lectoescritura (TDAH) o afecciones vocales del docente, y ofrece a los estudiantes un entorno seguro de navegación e interacción lúdica, controlable mediante comandos de voz nativos.

**Enlace de la aplicación desplegada:** [AQUÍ VA TU LINK DE VERCEL/NETLIFY]

---

## 🌟 Características Principales e Impacto en el Aula

- **Inclusión y Accesibilidad (TDAH y Oralidad):** Incorpora un motor de lectura guiada (*Narrador*) y herramientas de apoyo visual para estudiantes con dificultades de lectoescritura, sirviendo además como contingencia si el docente presenta problemas de salud vocal (gripe, disfonía).
- **Entorno de Navegación Seguro:** Centraliza la información cargada y filtrada por el docente, garantizando que los alumnos accedan a contenido pedagógico "sano", eliminando los riesgos de la navegación abierta en internet y reduciendo costos de impresión de material.
- **Control por Voz Innovador:** Sistema hands-free (manos libres) que responde a comandos naturales (*"abrir historial"*, *"abrir juego"*, *"cerrar panel"*), fomentando la interacción tecnológica interactiva en clase.
- **Gamificación Formativa:** Juego de agilidad matemática de más de 1000 ejercicios que recompensa con coronas y puntos bajo un enfoque de "gimnasia mental", estimulando el progreso individual sin generar frustración ni competencia tóxica entre compañeros.

---

## 👥 Arquitectura de Roles y Administración

1. **Estudiante / Público:** Acceso libre para navegar los contenidos del docente y participar en el módulo de cálculos matemáticos.
2. **Administrador (Docente):** Acceso unificado mediante credencial institucional para cargar, editar, actualizar o eliminar contenido pedagógico con soporte de imágenes.
3. **SuperAdministrador (Creador/Métricas de Impacto):** Panel estadístico profesional que rastrea la cantidad de docentes activos y el volumen de contenido cargado, permitiendo validar la tasa de adopción y la utilidad real de la herramienta en el sistema educativo.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React.js, Tailwind CSS (Modo Oscuro de Alta Visibilidad), Web Speech API (`SpeechRecognition` y `SpeechSynthesis`), SweetAlert2 (Toasts de confirmación de voz).
- **Backend:** Node.js, Express.js.
- **Base de Datos & Almacenamiento:** MongoDB (Persistencia de contenidos y usuarios), Cloudinary API (Optimización y almacenamiento en la nube de imágenes pedagógicas).
- **Reportes:** jsPDF, html2canvas.

Memoria de Desarrollo Potenciada

CURSO: Desarrollo de Aplicaciones Web con Inteligencia Artificial

PROYECTO FINAL INTEGRADOR: EduVoice: Plataforma de Innovación Aúlica y Accesibilidad

ESTUDIANTE: Rodrigo Salomon Ferreira Romano

DOCENTES: Cátedra de Desarrollo de Aplicaciones Web con IA

1. Introducción y Justificación del Problema (El Porqué del Proyecto)
El entorno áulico contemporáneo se enfrenta a múltiples desafíos: presupuestos ajustados que impiden la impresión constante de material didáctico, la exposición de los menores a contenido inseguro en internet, y la necesidad de herramientas de inclusión para estudiantes con Trastorno por Déficit de Atención con Hiperactividad (TDAH) o dificultades de lectoescritura. A esto se suman problemas de salud ocupacional de los docentes (como disfonías por gripe o uso intensivo de la voz) y barreras emocionales de los alumnos, quienes muchas veces evitan leer en voz alta por temor a la burla de sus pares.

La Solución: EduVoice aborda estas problemáticas mediante el desarrollo de una aplicación web full-stack que requiere infraestructura mínima: una computadora y un proyector. La herramienta digitaliza el contenido del día, ofrece un narrador automatizado como soporte de lectura y accesibilidad, protege la integridad digital del alumnado con información pre-aprobada por el docente, e introduce una gamificación saludable sin ránkings competitivos que funciona como un estímulo diario de ejercitación cognitiva.

2. Arquitectura de Software, Datos y Lógica de Negocio
Para dar soporte a estas necesidades, se optó por un desarrollo robusto dividido en capas claras:

Persistencia de Datos Híbrida: Se implementó MongoDB como base de datos NoSQL para almacenar de forma flexible los bloques de texto educativo, referencias del historial y registros de configuración. El manejo de archivos multimedia se delegó en la API de Cloudinary, lo que garantiza que las imágenes se compriman y sirvan de manera óptima en el aula sin saturar el servidor.

Modelo de Permisos y Analítica (Roles):

Docente (Admin): Autenticación simplificada para agilizar el ingreso en el aula, con operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar) sobre la base de datos de contenido.

Creador (SuperAdmin): Una capa estadística orientada a la toma de decisiones basada en datos. Este panel cuantifica cuántos docentes utilizan el sistema y la frecuencia de uso, validando si el software responde a una necesidad real del ecosistema educativo.

Interfaz de Control por Voz Interactiva: Integrada en el frontend a través de la Web Speech API, procesa cadenas lingüísticas limpiando caracteres mediante expresiones regulares en tiempo real, permitiendo que tanto el docente frente a la clase como el alumno puedan gobernar el estado de los componentes (setActive()), incluyendo la instrucción unificada de repliegue de pestañas mediante comandos de cortocircuito prioritarios ("cerrar panel").

3. El Rol de la Inteligencia Artificial como Copiloto
La Inteligencia Artificial se utilizó de forma activa bajo la modalidad de desarrollo guiado (AI-Driven Development). Su intervención fue crítica en:

Seguridad y Arquitectura de Control por Voz: Resolviendo solapamientos semánticos en las sentencias lógicas condicionales dentro del componente ButtonPanel.jsx, garantizando que las órdenes de cierre intercepten el flujo antes de ejecutar aperturas accidentales.

Sincronización del DOM: Ajustando micro-retrasos (setTimeout) para permitir que las notificaciones dinámicas tipo Toast de SweetAlert2 no fueran destruidas por los re-renderizados bruscos al cambiar de pestañas modulares en React.

Prompt Relevante de Ejemplo:

"Necesito interceptar comandos de voz en una app de React antes de que disparen otras condiciones. Si el usuario dice 'cerrar panel', debe limpiar el estado con setActive(null) e interrumpir cualquier evaluación posterior para evitar conflictos con palabras clave similares en los subcomponentes."

4. Conclusiones, Límites y Trabajo Futuro
Límites Identificados: El sistema de reconocimiento de voz depende del hardware del micrófono del aula y de la conectividad para consultar el motor nativo del navegador. La gamificación matemática actual, al no registrar persistencia por diseño filosófico (evitar la competencia), se reinicia al refrescar el navegador.

Trabajo Futuro:

Evolucionar el juego de matemáticas hacia un almacenamiento local protegido (localStorage) para que el alumno mantenga su conteo personal de coronas sin exponer un ranking público.

Migrar el sistema unificado de claves de docentes a un sistema de invitaciones por correo para robustecer la auditoría del panel de SuperAdmin.

repositoria backend: 
https://github.com/rodrigoromano23/MiContenidoDidacticoBack.git

repositorio del frontend 


