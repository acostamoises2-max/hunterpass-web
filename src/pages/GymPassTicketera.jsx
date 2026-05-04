import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function emailToKey(email) {
  return email.toLowerCase().replace(/\./g, "_").replace(/@/g, "--");
}

function getGymTheme(gymInfo) {
  return {
    primary: gymInfo.color || "#22d3ee",
    textOnPrimary: gymInfo.colorText || "#000000",
  };
}

// ── CÍRCULO DE PROGRESO SVG ───────────────────────────────────────────────────
function CircleProgress({ pct, color, left, total }) {
  const C = 251.2;
  const safeP = Math.min(Math.max(pct, 0), 100);
  const offset = C - (C * safeP) / 100;
  const strokeColor = safeP > 50 ? color : safeP > 25 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={strokeColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="251.2"
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-3xl leading-none" style={{ color: strokeColor }}>{left}</span>
        <span className="text-slate-400 text-xs mt-0.5">/{total}</span>
      </div>
    </div>
  );
}

// ── MODAL QR ──────────────────────────────────────────────────────────────────
function QRModal({ member, gymId, gymColor, gymTextColor, onClose }) {
  const qrRef = useRef(null);

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = "";
    const data = JSON.stringify({ id: member.id, email: member.email, gymId, v: 1 });

    function generate() {
      if (qrRef.current) {
        // eslint-disable-next-line no-undef
        new window.QRCode(qrRef.current, {
          text: data,
          width: 260,
          height: 260,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: window.QRCode?.CorrectLevel?.H,
        });
      }
    }

    if (!window.QRCode) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = generate;
      document.head.appendChild(script);
    } else {
      generate();
    }
  }, [member, gymId]);

  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `gympass-${member.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0b1629] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border"
        style={{ borderColor: gymColor + "40" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: gymColor }}>
          Tu GymPass
        </div>
        <h3 className="font-black text-xl mb-0.5">{member.firstName} {member.lastName}</h3>
        <p className="text-slate-400 text-sm mb-1">{member.plan?.name}</p>
        <p className="font-bold text-lg mb-5" style={{ color: gymColor }}>
          {member.classesLeft}{" "}
          <span className="text-slate-400 font-normal text-sm">/ {member.classesTotal} clases</span>
        </p>
        <div className="flex justify-center mb-6">
          <div ref={qrRef} className="bg-white p-3 rounded-xl inline-block" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadQR}
            className="flex-1 font-bold py-3 rounded-xl text-sm"
            style={{ backgroundColor: gymColor, color: gymTextColor || "#000" }}
          >
            Descargar PNG
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL CONSULTA POR WHATSAPP ───────────────────────────────────────────────
function WaConsultModal({ plan, gymInfo, color, textOnPrimary, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", discipline: "", message: "" });
  const [err, setErr] = useState("");

  const borderDefault = "rgba(255,255,255,0.1)";

  function fieldProps(field) {
    return {
      value: form[field],
      onChange: (e) => setForm({ ...form, [field]: e.target.value }),
      onFocus: (e) => { e.target.style.borderColor = color + "80"; },
      onBlur: (e) => { e.target.style.borderColor = borderDefault; },
      className: "w-full bg-black/40 border rounded-xl text-white placeholder:text-slate-500 text-sm outline-none px-4 transition-colors",
      style: { borderColor: borderDefault, minHeight: "48px" },
    };
  }

  function send() {
    if (!form.name.trim() || !form.email.trim()) {
      setErr("Nombre y email son obligatorios.");
      return;
    }
    const waNumber = gymInfo.whatsapp || "5492227000000";
    const priceStr = "$" + plan.price.toLocaleString("es-AR");
    const msg = [
      `Hola ${gymInfo.name}, quiero consultar sobre el plan:`,
      "",
      `📋 *Plan:* ${plan.name} — ${priceStr}`,
      `👤 *Nombre:* ${form.name}`,
      `📧 *Email:* ${form.email}`,
      `📱 *Teléfono:* ${form.phone || "No indicado"}`,
      `🏋️ *Disciplina:* ${form.discipline || "Sin especificar"}`,
      `💬 *Consulta:* ${form.message || "Sin consulta adicional"}`,
    ].join("\n");
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d0d0d] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-10 sm:pb-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color }}>
              CONSULTAR PLAN
            </div>
            <h3 className="font-black text-lg leading-tight text-white">{plan.name}</h3>
            <p className="font-bold text-sm mt-0.5" style={{ color }}>
              ${plan.price.toLocaleString("es-AR")} ARS
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-2xl leading-none p-1 ml-4 flex-shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input placeholder="Nombre completo *" {...fieldProps("name")} />
          <input type="email" placeholder="Email *" {...fieldProps("email")} />
          <input type="tel" placeholder="Teléfono" {...fieldProps("phone")} />

          {gymInfo.disciplines?.length > 0 && (
            <select
              value={form.discipline}
              onChange={(e) => setForm({ ...form, discipline: e.target.value })}
              onFocus={(e) => { e.target.style.borderColor = color + "80"; }}
              onBlur={(e) => { e.target.style.borderColor = borderDefault; }}
              className="w-full bg-black/40 border rounded-xl text-white text-sm outline-none px-4 transition-colors"
              style={{ borderColor: borderDefault, minHeight: "48px" }}
            >
              <option value="">Disciplina de interés</option>
              {gymInfo.disciplines.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          <textarea
            placeholder="Mensaje adicional (opcional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = color + "80"; }}
            onBlur={(e) => { e.target.style.borderColor = borderDefault; }}
            rows={2}
            className="w-full bg-black/40 border rounded-xl text-white placeholder:text-slate-500 text-sm outline-none px-4 py-3 resize-none transition-colors"
            style={{ borderColor: borderDefault }}
          />

          {err && <p className="text-red-400 text-sm">{err}</p>}

          <button
            onClick={send}
            className="w-full flex items-center justify-center gap-2 font-black rounded-xl text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: "#25d366", color: "#fff", minHeight: "52px" }}
          >
            {WA_ICON}
            ENVIAR POR WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Cargando información del gym...</p>
      </div>
    </div>
  );
}

function NotFound({ gymId }) {
  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">🏗️</div>
      <h2 className="font-black text-2xl">Gym no encontrado</h2>
      <p className="text-slate-400 text-sm">
        No existe un gym con el ID: <code className="text-cyan-400">{gymId}</code>
      </p>
      <Link to="/pass/gym" className="mt-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
        ← Ver todos los gyms
      </Link>
    </div>
  );
}

// ── HERO especial GO! Funcional ───────────────────────────────────────────────
function GoHero({ gymInfo }) {
  return (
    <section className="relative max-w-4xl mx-auto px-6 pt-16 pb-12 text-center" style={{ isolation: "isolate" }}>
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.04]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />
      <div
        className="font-black leading-none tracking-tight select-none"
        style={{ fontSize: "clamp(72px,18vw,140px)", color: "#F5C400", letterSpacing: "-4px", lineHeight: 0.9 }}
      >
        GO!
      </div>
      <div className="font-black text-white mt-3 tracking-[0.3em] text-xl md:text-2xl uppercase">
        FUNCIONAL GYM
      </div>
      <div style={{ background: "#F5C400", height: "3px", width: "60px", borderRadius: "2px", margin: "16px auto" }} />
      <p className="text-slate-400 text-base">PEDÍ TU PASE. ENTRÁ CON TU QR.</p>
      {gymInfo.address && <p className="mt-2 text-slate-500 text-xs">📍 {gymInfo.address}</p>}
    </section>
  );
}

// ── HERO genérico ─────────────────────────────────────────────────────────────
function GenericHero({ gymInfo, color }) {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-14 pb-10 text-center">
      <div className="text-5xl mb-4">{gymInfo.emoji}</div>
      <h1 className="text-3xl md:text-5xl font-black leading-tight">
        PEDÍ TU PASE.
        <br />
        <span style={{ color }}>ENTRÁ CON TU QR.</span>
      </h1>
      <p className="mt-3 font-semibold text-lg" style={{ color }}>{gymInfo.name}</p>
      <p className="mt-1 text-slate-400 text-sm">{gymInfo.tagline}</p>
      {gymInfo.address && <p className="mt-2 text-slate-500 text-xs">📍 {gymInfo.address}</p>}
    </section>
  );
}

// ── DISCIPLINAS ───────────────────────────────────────────────────────────────
function DisciplinasSection({ disciplines, color }) {
  if (!disciplines?.length) return null;
  return (
    <section className="max-w-4xl mx-auto px-6 pb-10">
      <div className="text-xs font-black tracking-widest uppercase mb-4" style={{ color }}>
        Disciplinas
      </div>
      <div className="flex flex-wrap gap-2">
        {disciplines.map((d) => (
          <span
            key={d}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-semibold"
            style={{ backgroundColor: "#111111", border: `1px solid ${color}30`, color: "#fff" }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {d}
          </span>
        ))}
      </div>
    </section>
  );
}

// Planes reales GO! Funcional — se sincronizan en Firestore al cargar
const GO_FUNCIONAL_PLANS = [
  { id: "2x-semana", name: "2 veces por semana", classesPerWeek: 2, classesTotal: 8, price: 30000, description: "8 clases por mes" },
  { id: "3x-semana", name: "3 veces por semana", classesPerWeek: 3, classesTotal: 12, price: 35000, featured: true, description: "12 clases por mes" },
  { id: "libre", name: "Mensual Libre", classesPerWeek: null, classesTotal: 20, price: 40000, description: "Asistencia libre todo el mes" },
  { id: "suelta", name: "Clase Suelta", classesPerWeek: null, classesTotal: 1, price: 7000, description: "Una clase individual" },
];

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function GymPassTicketera() {
  const { gymId = "default" } = useParams();

  const [gymInfo, setGymInfo] = useState(null);
  const [gymLoading, setGymLoading] = useState(true);
  const [gymNotFound, setGymNotFound] = useState(false);

  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupQr, setLookupQr] = useState(null);

  const [waModalPlan, setWaModalPlan] = useState(null);

  const seedDoneRef = useRef(false);

  useEffect(() => {
    async function loadGym() {
      setGymLoading(true);
      try {
        const snap = await getDoc(doc(db, "gyms", gymId));
        if (snap.exists()) {
          setGymInfo(snap.data());
        } else {
          setGymNotFound(true);
        }
      } catch {
        setGymNotFound(true);
      } finally {
        setGymLoading(false);
      }
    }
    loadGym();
  }, [gymId]);

  // Sincronizar planes GO! Funcional en Firestore (una vez por sesión)
  useEffect(() => {
    if (gymId !== "go-funcional" || !gymInfo || seedDoneRef.current) return;
    seedDoneRef.current = true;
    const currentIds = (gymInfo.plans || []).map((p) => p.id).sort().join(",");
    const expectedIds = GO_FUNCIONAL_PLANS.map((p) => p.id).sort().join(",");
    if (currentIds === expectedIds) return;
    const update = { plans: GO_FUNCIONAL_PLANS };
    if (!gymInfo.whatsapp) update.whatsapp = "5492227XXXXXX";
    setDoc(doc(db, "gyms", "go-funcional"), update, { merge: true })
      .then(() => setGymInfo((prev) => ({ ...prev, ...update })))
      .catch(console.error);
  }, [gymId, gymInfo]);

  if (gymLoading) return <LoadingSkeleton />;
  if (gymNotFound) return <NotFound gymId={gymId} />;

  const theme = getGymTheme(gymInfo);
  const { primary: color, textOnPrimary } = theme;
  const plans = gymInfo.plans || [];
  const isGoFuncional = gymId === "go-funcional";
  const bgCard = isGoFuncional ? "#111" : "#0b1629";

  async function handleLookup() {
    setLookupError("");
    setLookupResult(null);
    if (!lookupEmail) return;
    setLookupLoading(true);
    try {
      const key = emailToKey(lookupEmail);
      const snap = await getDoc(doc(db, "gyms", gymId, "members", key));
      if (snap.exists()) {
        setLookupResult(snap.data());
      } else {
        setLookupError("No encontramos un pase con ese email.");
      }
    } catch {
      setLookupError("Error al buscar. Intentá de nuevo.");
    } finally {
      setLookupLoading(false);
    }
  }

  const lookupPct = lookupResult
    ? lookupResult.classesTotal > 0
      ? (lookupResult.classesLeft / lookupResult.classesTotal) * 100
      : 0
    : 0;

  return (
    <div
      className="text-white min-h-screen font-sans"
      style={{ backgroundColor: isGoFuncional ? "#0d0d0d" : "#030712" }}
    >
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${color}12 1px, transparent 1px), linear-gradient(90deg, ${color}12 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* NavBar */}
      <nav
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{
          backgroundColor: isGoFuncional ? "rgba(13,13,13,0.92)" : "rgba(3,7,18,0.92)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <img src="/logo-hunterpass.png" alt="HunterPass" className="h-9 w-auto opacity-70" />
          <div className="w-px h-5 bg-white/10" />
          {isGoFuncional ? (
            <>
              <span className="font-black text-sm leading-none" style={{ color: "#F5C400", letterSpacing: "-0.5px" }}>GO!</span>
              <span className="text-slate-400 text-xs tracking-widest hidden sm:block">FUNCIONAL GYM</span>
            </>
          ) : (
            <>
              <span className="text-xl">{gymInfo.emoji}</span>
              <span className="font-black text-white tracking-wide text-sm">{gymInfo.name}</span>
            </>
          )}
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + "20", color, border: `1px solid ${color}40` }}
          >
            GYMPASS
          </span>
          <div className="flex-1" />
          <Link to="/pass" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Volver
          </Link>
        </div>
      </nav>

      {/* ── A. HERO ── */}
      {isGoFuncional ? <GoHero gymInfo={gymInfo} /> : <GenericHero gymInfo={gymInfo} color={color} />}

      {/* ── B. TU PASE (consulta principal) ── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div
          className="border rounded-2xl p-6 sm:p-7"
          style={{ backgroundColor: bgCard, borderColor: color + "35" }}
        >
          <div className="text-xs font-black tracking-widest uppercase mb-1" style={{ color }}>
            TU PASE
          </div>
          <p className="text-slate-400 text-sm mb-5">Ingresá tu email para ver tu QR</p>

          {/* Input + buscar */}
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              placeholder="tu@email.com"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none px-4 transition-colors"
              style={{ minHeight: "48px" }}
            />
            <button
              onClick={handleLookup}
              disabled={lookupLoading}
              className="font-black rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-50 px-6 flex-shrink-0"
              style={{ backgroundColor: color, color: textOnPrimary, minHeight: "48px" }}
            >
              {lookupLoading ? "..." : "BUSCAR"}
            </button>
          </div>

          {lookupError && <p className="text-red-400 text-sm mt-2">{lookupError}</p>}

          {/* Resultado — card estilo Fiter */}
          {lookupResult && (
            <div className="mt-5 rounded-2xl border p-5 sm:p-6" style={{ backgroundColor: isGoFuncional ? "#0d0d0d" : "#030712", borderColor: color + "25" }}>

              {/* Banners de alerta */}
              {lookupResult.classesLeft === 0 && (
                <div className="mb-4 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-center">
                  <p className="text-red-400 font-bold text-sm">Sin clases — contactá al gym para renovar</p>
                </div>
              )}
              {lookupResult.classesLeft > 0 && lookupResult.classesLeft <= 2 && (
                <div className="mb-4 bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3 text-center">
                  <p className="text-amber-400 font-bold text-sm">⚠ Últimas clases</p>
                </div>
              )}

              {/* Avatar + nombre + plan */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xl"
                  style={{ backgroundColor: color + "20", color, border: `2px solid ${color}40` }}
                >
                  {lookupResult.firstName?.[0]}{lookupResult.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-black text-xl leading-tight">
                    {lookupResult.firstName} {lookupResult.lastName}
                  </h3>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full mt-1.5 inline-block"
                    style={{ backgroundColor: color + "20", color, border: `1px solid ${color}40` }}
                  >
                    {lookupResult.plan?.name}
                  </span>
                </div>
              </div>

              {/* Círculo de progreso */}
              <div className="mb-2">
                <p className="text-slate-500 text-xs text-center tracking-widest uppercase mb-4">
                  Clases disponibles
                </p>
                <CircleProgress
                  pct={lookupPct}
                  color={color}
                  left={lookupResult.classesLeft}
                  total={lookupResult.classesTotal}
                />
              </div>

              {/* Botón VER MI QR */}
              <button
                onClick={() => setLookupQr(lookupResult)}
                className="w-full font-black rounded-xl text-base transition-all hover:brightness-110 mt-6 flex items-center justify-center gap-2"
                style={{ backgroundColor: color, color: textOnPrimary, minHeight: "54px" }}
              >
                VER MI QR →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── C. DISCIPLINAS ── */}
      <DisciplinasSection disciplines={gymInfo.disciplines} color={color} />

      {/* ── D. PLANES Y PRECIOS ── */}
      {plans.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-12">
          <div className="text-xs font-black tracking-widest uppercase mb-1" style={{ color }}>
            Planes
          </div>
          <p className="text-slate-400 text-sm mb-5">Consultá con el gym para activar tu pase</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => (
              <div
                key={p.id}
                className="relative rounded-2xl border p-5 flex flex-col gap-4"
                style={{
                  backgroundColor: bgCard,
                  borderColor: p.featured ? color + "50" : "rgba(255,255,255,0.08)",
                }}
              >
                {p.featured && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ backgroundColor: color }} />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-base leading-tight">{p.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{p.description}</p>
                  </div>
                  {p.featured && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color, color: textOnPrimary }}
                    >
                      ⚡ Más elegido
                    </span>
                  )}
                </div>

                <p className="font-black text-2xl leading-none" style={{ color }}>
                  ${p.price.toLocaleString("es-AR")}
                  <span className="text-slate-500 text-sm font-normal ml-1.5">ARS / mes</span>
                </p>

                <button
                  onClick={() => setWaModalPlan(p)}
                  className="flex items-center justify-center gap-2 font-bold rounded-xl text-sm transition-all hover:brightness-110"
                  style={{ backgroundColor: "#25d366", color: "#fff", minHeight: "48px" }}
                >
                  {WA_ICON}
                  CONSULTAR POR WHATSAPP
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── E. FOOTER ── */}
      <footer
        className="border-t border-white/5 px-6 py-10 text-center"
        style={{ backgroundColor: isGoFuncional ? "#0a0a0a" : "transparent" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
          <img src="/logo-hunterpass.png" alt="HunterPass" className="h-7 w-auto opacity-50 mb-1" />
          <span className="font-black text-sm" style={{ color }}>
            {isGoFuncional ? "GO! Funcional Gym" : gymInfo.name}
          </span>
          {gymInfo.address && (
            <p className="text-slate-500 text-xs">📍 {gymInfo.address}</p>
          )}
          {gymInfo.instagram && (
            <a
              href={gymInfo.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-slate-500 hover:text-white transition-colors mt-1"
            >
              Instagram →
            </a>
          )}
        </div>
      </footer>

      {/* Modales */}
      {lookupQr && (
        <QRModal
          member={lookupQr}
          gymId={gymId}
          gymColor={color}
          gymTextColor={textOnPrimary}
          onClose={() => setLookupQr(null)}
        />
      )}
      {waModalPlan && (
        <WaConsultModal
          plan={waModalPlan}
          gymInfo={gymInfo}
          color={color}
          textOnPrimary={textOnPrimary}
          onClose={() => setWaModalPlan(null)}
        />
      )}
    </div>
  );
}
