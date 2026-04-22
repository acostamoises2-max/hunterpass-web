import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";

const GO_FUNCIONAL = {
  id: "go-funcional",
  name: "GO! Funcional Gym",
  tagline: "Un lugar donde la salud y el bienestar son prioridad",
  description: "CrossTraining, Box Libre, Solo Mujeres, Prep. Física Deportiva e Infantil, Funcional y Zumba. Comunidad activa en Navarro, Buenos Aires.",
  address: "Calle 9 e/ 24 y 26 — Navarro, Buenos Aires",
  color: "#F5C400",
  colorDark: "#1a1400",
  colorText: "#000000",
  emoji: "GO!",
  logo: null,
  instagram: "https://www.instagram.com/go_funcionalgym",
  disciplines: [
    "CrossTraining", "Box Libre", "Solo Mujeres",
    "Prep. Física Deportiva", "Prep. Física Infantil", "Funcional", "Zumba",
  ],
  schedule: [
    { time: "13:30", days: ["Lunes", "Miércoles", "Viernes"], class: "CrossTraining", color: "#F5C400" },
    { time: "14:00", days: ["Martes", "Jueves"], class: "Box Libre", color: "#f97316" },
    { time: "14:00", days: ["Martes", "Jueves"], class: "Prep. Física Deportiva", color: "#3b82f6" },
    { time: "14:30", days: ["Lunes", "Miércoles", "Viernes"], class: "Solo Mujeres", color: "#ec4899" },
    { time: "15:00", days: ["Martes", "Jueves"], class: "Prep. Física Deportiva", color: "#3b82f6" },
    { time: "16:00", days: ["Martes", "Jueves"], class: "Solo Mujeres", color: "#ec4899" },
    { time: "18:00", days: ["Lunes", "Martes", "Jueves", "Viernes"], class: "Prep. Física Infantil", color: "#10b981" },
    { time: "19:00", days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"], class: "CrossTraining", color: "#F5C400" },
    { time: "20:00", days: ["Lunes", "Miércoles"], class: "CrossTraining", color: "#F5C400" },
    { time: "20:00", days: ["Martes", "Jueves"], class: "Solo Mujeres", color: "#ec4899" },
    { time: "20:00", days: ["Viernes"], class: "Box Libre", color: "#f97316" },
    { time: "21:00", days: ["Lunes", "Miércoles"], class: "Box Libre", color: "#f97316" },
    { time: "21:00", days: ["Martes", "Jueves"], class: "Prep. Física Deportiva", color: "#3b82f6" },
  ],
  plans: [
    { id: "starter", name: "Pack 10 Clases", classes: 10, price: 4500 },
    { id: "regular", name: "Pack 12 Clases", classes: 12, price: 5200, featured: true },
    { id: "mensual", name: "Mensual Ilimitado", classes: 20, price: 7800 },
  ],
  active: true,
  createdAt: new Date().toISOString(),
};

const PLACEHOLDER_GYMS = [
  {
    id: "crossfit-norte",
    name: "CrossFit Norte",
    tagline: "Entrenamiento funcional de élite",
    description: "El mejor box de CrossFit de la zona norte.",
    address: "Av. del Libertador 1234, Buenos Aires",
    color: "#f97316", colorDark: "#431407", emoji: "🔥", logo: null,
    plans: [
      { id: "starter", name: "Pack Básico", classes: 10, price: 4500 },
      { id: "regular", name: "Pack Regular", classes: 12, price: 5800 },
      { id: "mensual", name: "Sin Límite", classes: 20, price: 8500 },
    ],
    active: true, createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "iron-house",
    name: "Iron House",
    tagline: "Fuerza, disciplina y resultados",
    description: "Gym de musculación y powerlifting con equipamiento de alto nivel.",
    address: "Corrientes 567, Buenos Aires",
    color: "#8b5cf6", colorDark: "#2e1065", emoji: "💪", logo: null,
    plans: [
      { id: "starter", name: "Pack 10", classes: 10, price: 4200 },
      { id: "regular", name: "Pack 12", classes: 12, price: 5000 },
      { id: "mensual", name: "Mensual", classes: 20, price: 7500 },
    ],
    active: true, createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "move-studio",
    name: "Move Studio",
    tagline: "Yoga, pilates y movimiento consciente",
    description: "Espacio de bienestar integral con clases de yoga, pilates y meditación.",
    address: "Palermo Soho, Buenos Aires",
    color: "#10b981", colorDark: "#064e3b", emoji: "🧘", logo: null,
    plans: [
      { id: "starter", name: "Pack 10", classes: 10, price: 4000 },
      { id: "regular", name: "Pack 12", classes: 12, price: 4800 },
      { id: "mensual", name: "Mensual", classes: 20, price: 7200 },
    ],
    active: true, createdAt: "2024-01-01T00:00:00.000Z",
  },
];

async function seedGyms() {
  // Almacena directo en gyms/{gymId} para que getDocs(collection) los devuelva
  const check = await getDoc(doc(db, "gyms", "go-funcional"));
  if (check.exists()) return;
  await setDoc(doc(db, "gyms", "go-funcional"), GO_FUNCIONAL);
  await Promise.all(
    PLACEHOLDER_GYMS.map((gym) => setDoc(doc(db, "gyms", gym.id), gym))
  );
}

// Card especial para GO! Funcional
function GoFuncionalCard({ gym }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/pass/gym/${gym.id}`}
      className="block rounded-2xl overflow-hidden border transition-all duration-300"
      style={{
        backgroundColor: "#0d0d0d",
        borderColor: hovered ? "#F5C40040" : "rgba(245,196,0,0.15)",
        boxShadow: hovered ? "0 20px 40px #F5C40025" : "0 4px 20px rgba(0,0,0,0.4)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header negro con texto GO! */}
      <div
        className="relative h-36 flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(160deg, #1a1400 0%, #0d0d0d 100%)" }}
      >
        <div
          className="font-black leading-none tracking-tight"
          style={{ fontSize: "52px", color: "#F5C400", letterSpacing: "-1px" }}
        >
          GO!
        </div>
        <div className="text-white text-xs tracking-[0.35em] font-bold mt-1 opacity-80">
          FUNCIONAL GYM
        </div>
        {/* Línea amarilla decorativa */}
        <div style={{ background: "#F5C400", height: "2px", width: "40px", borderRadius: "2px", marginTop: "10px" }} />
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-black text-lg text-white">{gym.name}</h3>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2"
            style={{ backgroundColor: "#F5C400", color: "#000" }}
          >
            Disponible
          </span>
        </div>
        <p className="text-slate-400 text-sm mb-1">{gym.tagline}</p>
        <p className="text-slate-500 text-xs flex items-center gap-1 mb-3">
          <span>📍</span> {gym.address}
        </p>

        {/* Disciplinas pills */}
        {gym.disciplines?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {gym.disciplines.map((d) => (
              <span
                key={d}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  border: "1px solid #F5C40030",
                  color: "#F5C400",
                  backgroundColor: "#F5C40008",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        )}

        <div
          className="w-full text-center py-2.5 rounded-xl font-black text-sm transition-all"
          style={{
            backgroundColor: "#F5C400",
            color: "#000",
            filter: hovered ? "brightness(1.1)" : "brightness(1)",
          }}
        >
          Ver pases →
        </div>
      </div>
    </Link>
  );
}

// Card genérica para otros gyms
function GymCard({ gym }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/pass/gym/${gym.id}`}
      className="block bg-[#0b1629] rounded-2xl overflow-hidden border transition-all duration-300"
      style={{
        borderColor: hovered ? gym.color + "60" : "rgba(255,255,255,0.08)",
        boxShadow: hovered ? `0 20px 40px ${gym.color}20` : "none",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative h-36 flex flex-col items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${gym.color}33 0%, ${gym.colorDark} 100%)` }}
      >
        <span className="text-5xl mb-2">{gym.emoji}</span>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: gym.color + "25", color: gym.color, border: `1px solid ${gym.color}40` }}
        >
          {gym.name}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-black text-lg text-white mb-1">{gym.name}</h3>
        <p className="text-slate-400 text-sm mb-2">{gym.tagline}</p>
        <p className="text-slate-500 text-xs flex items-center gap-1 mb-4">
          <span>📍</span> {gym.address}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500">{gym.plans?.length || 0} planes disponibles</span>
          <div className="flex gap-1">
            {(gym.plans || []).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: gym.color + "80" }} />
            ))}
          </div>
        </div>
        <div
          className="w-full text-center py-2.5 rounded-xl font-bold text-sm"
          style={{ backgroundColor: gym.color, color: "#000", opacity: hovered ? 1 : 0.85 }}
        >
          Ver pases →
        </div>
      </div>
    </Link>
  );
}

export default function GymCatalog() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        await seedGyms();
        const gymSnap = await getDocs(collection(db, "gyms"));
        const results = gymSnap.docs
          .map((d) => d.data())
          .filter((g) => g.active);
        // GO! Funcional siempre primero
        const sorted = results.sort((a, b) =>
          a.id === "go-funcional" ? -1 : b.id === "go-funcional" ? 1 : 0
        );
        setGyms(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* NavBar */}
      <nav className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/">
            <img src="/logo-hunterpass.png" alt="HunterPass" className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity" />
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <span className="font-black text-white tracking-widest text-sm">GYMS</span>
          {!loading && (
            <span className="text-xs bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">
              {gyms.length} activos
            </span>
          )}
          <div className="flex-1" />
          <Link to="/pass" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            ← Plataforma
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-block bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
          GymPass · Catálogo
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight">
          ENCONTRÁ
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
            TU GYM
          </span>
        </h1>
        <p className="mt-4 text-slate-400 max-w-lg mx-auto leading-relaxed">
          Elegí tu gimnasio, comprá tus clases y accedé con tu QR personal.
        </p>
      </section>

      {/* Catálogo */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0b1629] border border-white/8 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-9 bg-white/5 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🏗️</div>
            <h3 className="font-bold text-xl mb-2">Próximamente</h3>
            <p className="text-slate-400">Gyms disponibles en tu zona muy pronto.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {gyms.map((gym) =>
              gym.id === "go-funcional"
                ? <GoFuncionalCard key={gym.id} gym={gym} />
                : <GymCard key={gym.id} gym={gym} />
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hunterpass.png" alt="HunterPass" className="h-7 w-auto opacity-60" />
            <span className="text-sm text-slate-500">GymPass · HunterPass</span>
          </div>
          <Link to="/pass" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
            ← Plataforma
          </Link>
        </div>
      </footer>
    </div>
  );
}
