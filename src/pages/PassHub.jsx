import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { getDocs, collection } from "firebase/firestore";

// ── MODAL BUSCADOR DE GYM ─────────────────────────────────────────────────────
function GymSearchModal({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "gyms"));
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((g) => g.active);
      const q = query.toLowerCase().trim();
      setResults(q ? all.filter((g) => g.name?.toLowerCase().includes(q)) : all);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
        style={{ maxHeight: "88vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-black text-xl tracking-tight text-white">ENCONTRÁ TU GYM</h2>
            <p className="text-slate-400 text-sm mt-0.5">Ingresá el nombre de tu gimnasio</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-2xl leading-none p-1 ml-4 flex-shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div className="flex gap-2 mb-5">
          <input
            placeholder="Ej: GO Funcional, Iron House..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            autoFocus
            className="flex-1 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50 px-4 transition-colors"
            style={{ height: "48px" }}
          />
          <button
            onClick={search}
            disabled={loading}
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-sm transition-colors disabled:opacity-50 px-5 flex-shrink-0"
            style={{ height: "48px", minWidth: "90px" }}
          >
            {loading ? "..." : "BUSCAR"}
          </button>
        </div>

        {/* No results */}
        {searched && results.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-300 font-semibold text-sm">No encontramos ese gym.</p>
            <p className="text-slate-500 text-xs mt-1">
              Verificá el nombre o consultá con tu gimnasio.
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((gym) => (
              <button
                key={gym.id}
                onClick={() => navigate(`/pass/gym/${gym.id}`)}
                className="w-full text-left bg-white/[0.03] border border-white/8 hover:border-white/25 rounded-xl p-4 transition-all flex items-center gap-4"
              >
                <div className="text-2xl flex-shrink-0">{gym.emoji || "🏋️"}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate">{gym.name}</div>
                  {gym.address && (
                    <div className="text-slate-400 text-xs mt-0.5 truncate">📍 {gym.address}</div>
                  )}
                </div>
                <span className="text-slate-400 text-lg flex-shrink-0">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function PassHub() {
  const [gymSearchOpen, setGymSearchOpen] = useState(false);

  const products = [
    {
      emoji: "🏋️",
      name: "GymPass",
      tag: "Disponible",
      tagAvailable: true,
      desc: "Pases de clases para gimnasio con QR personal",
      features: [
        "Pack de 10, 12 o 20 clases",
        "QR personal e intransferible",
        "Consulta tu saldo",
        "Descuento automático por clase",
      ],
      action: "search",
    },
    {
      emoji: "🎪",
      name: "EventPass",
      tag: "Próximamente",
      tagAvailable: false,
      desc: "Entradas digitales con QR para eventos, shows y experiencias únicas",
      features: [
        "Entrada digital con QR",
        "Control de acceso en puerta",
        "Historial de eventos",
        "Transferencia de entradas",
      ],
    },
    {
      emoji: "🏢",
      name: "CorpPass",
      tag: "Próximamente",
      tagAvailable: false,
      desc: "Accesos corporativos inteligentes para oficinas, coworkings y edificios",
      features: [
        "Acceso por QR o NFC",
        "Control por área y horario",
        "Registro de asistencia",
        "Panel de administración",
      ],
    },
  ];

  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* NavBar */}
      <nav className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hunterpass.png" alt="HunterPass" className="h-12 w-auto" />
            <div className="hidden sm:block">
              <div className="font-black text-white text-sm tracking-wider">HUNTERPASS</div>
              <div className="text-slate-400 text-xs">Pass Platform</div>
            </div>
          </div>
          <Link
            to="/"
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
          Pass Platform · Beta
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-white bg-clip-text text-transparent">
            TU PASE.
          </span>
          <br />
          <span className="text-white">DONDE LO NECESITES.</span>
        </h1>
        <p className="mt-5 text-slate-400 max-w-xl mx-auto leading-relaxed">
          Pases digitales inteligentes para gimnasios, eventos y espacios corporativos. Sin papel, sin complicaciones.
        </p>
      </section>

      {/* Cards grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {products.map(({ emoji, name, tag, tagAvailable, desc, features, action }) => (
            <div
              key={name}
              className={`relative bg-[#0b1629] border rounded-2xl p-7 flex flex-col gap-5 transition-all ${
                tagAvailable
                  ? "border-cyan-400/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-400/5"
                  : "border-white/10 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">{emoji}</span>
                  <h2 className="text-xl font-black mt-2">{name}</h2>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 ${
                    tagAvailable
                      ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                      : "bg-white/5 text-slate-500 border border-white/10"
                  }`}
                >
                  {tag}
                </span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>

              <ul className="space-y-2 flex-1">
                {features.map((f) => (
                  <li key={f} className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {tagAvailable ? (
                <button
                  onClick={() => action === "search" && setGymSearchOpen(true)}
                  className="block w-full text-center bg-cyan-400 hover:bg-cyan-300 transition-colors text-black font-bold py-3 rounded-xl text-sm"
                  style={{ minHeight: "48px" }}
                >
                  Acceder →
                </button>
              ) : (
                <button
                  disabled
                  className="block w-full text-center bg-white/5 text-slate-600 font-bold py-3 rounded-xl text-sm cursor-not-allowed border border-white/5"
                  style={{ minHeight: "48px" }}
                >
                  Próximamente
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Operator panel CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-semibold tracking-widest uppercase mb-1">Área operadores</div>
            <h3 className="font-bold text-white">¿Sos operador o administrador de GymPass?</h3>
            <p className="text-sm text-slate-400 mt-1">
              Accedé al panel interno para gestionar miembros, escanear QR y ver registros.
            </p>
          </div>
          <Link
            to="/panel/gym"
            className="flex-shrink-0 px-6 py-3 bg-white/5 border border-white/15 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            🔐 Acceder al panel →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img
                src="/logo-hunterpass.png"
                alt="HunterPass"
                className="h-8 w-auto opacity-60 hover:opacity-90 transition-opacity"
              />
            </Link>
            <span className="text-sm text-slate-500">
              Pass Platform &copy; {new Date().getFullYear()}
            </span>
          </div>
          <Link to="/" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
            hunterpass.com.ar
          </Link>
        </div>
      </footer>

      {gymSearchOpen && <GymSearchModal onClose={() => setGymSearchOpen(false)} />}
    </div>
  );
}
