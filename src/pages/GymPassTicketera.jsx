import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function randomId(len = 6) {
  return Math.random().toString(36).toUpperCase().slice(2, 2 + len);
}

function emailToKey(email) {
  return email.toLowerCase().replace(/\./g, "_").replace(/@/g, "--");
}

function getGymTheme(gymInfo) {
  return {
    primary: gymInfo.color || "#22d3ee",
    dark: gymInfo.colorDark || "#0b1629",
    textOnPrimary: gymInfo.colorText || "#000000",
  };
}

function ClassBar({ left, total, color }) {
  const pct = total > 0 ? (left / total) * 100 : 0;
  const barColor = pct > 50 ? color : pct > 25 ? "#f59e0b" : "#ef4444";
  return (
    <div className="w-full bg-white/10 rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
    </div>
  );
}

function QRModal({ member, gymId, gymColor, gymTextColor, onClose }) {
  const qrRef = useRef(null);

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = "";
    const data = JSON.stringify({ id: member.id, email: member.email, gymId, v: 1 });

    function generate() {
      if (qrRef.current) {
        // eslint-disable-next-line no-undef
        new QRCode(qrRef.current, {
          text: data,
          width: 220,
          height: 220,
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0b1629] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border"
        style={{ borderColor: gymColor + "40" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: gymColor }}>
          Tu GymPass
        </div>
        <h3 className="font-black text-xl mb-1">{member.firstName} {member.lastName}</h3>
        <p className="text-slate-400 text-sm mb-2">{member.plan?.name}</p>
        <p className="font-bold text-lg mb-4" style={{ color: gymColor }}>
          {member.classesLeft}{" "}
          <span className="text-slate-400 font-normal text-sm">/ {member.classesTotal} clases</span>
        </p>
        <div className="flex justify-center mb-6">
          <div ref={qrRef} className="bg-white p-3 rounded-xl inline-block" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadQR}
            className="flex-1 font-bold py-2.5 rounded-xl text-sm"
            style={{ backgroundColor: gymColor, color: gymTextColor || "#000" }}
          >
            Descargar PNG
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
          >
            Cerrar
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
      <p className="text-slate-400 text-sm">No existe un gym con el ID: <code className="text-cyan-400">{gymId}</code></p>
      <Link to="/pass/gym" className="mt-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
        ← Ver todos los gyms
      </Link>
    </div>
  );
}

// ── HERO especial para GO! Funcional ─────────────────────────────────────────
function GoHero({ gymInfo, color }) {
  return (
    <section
      className="relative max-w-4xl mx-auto px-6 pt-16 pb-12 text-center"
      style={{ isolation: "isolate" }}
    >
      {/* Grain / noise texture */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.04]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />
      {/* GO! big */}
      <div
        className="font-black leading-none tracking-tight select-none"
        style={{ fontSize: "clamp(72px,18vw,140px)", color: "#F5C400", letterSpacing: "-4px", lineHeight: 0.9 }}
      >
        GO!
      </div>
      <div
        className="font-black text-white mt-3 tracking-[0.3em] text-xl md:text-2xl uppercase"
      >
        FUNCIONAL GYM
      </div>
      {/* Línea decorativa */}
      <div style={{ background: "#F5C400", height: "3px", width: "60px", borderRadius: "2px", margin: "16px auto" }} />
      <p className="text-slate-400 text-base">COMPRÁ TUS CLASES. ENTRÁ CON TU QR.</p>
      {gymInfo.address && (
        <p className="mt-2 text-slate-500 text-xs">📍 {gymInfo.address}</p>
      )}
    </section>
  );
}

// ── HERO genérico ─────────────────────────────────────────────────────────────
function GenericHero({ gymInfo, color }) {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-14 pb-10 text-center">
      <div className="text-5xl mb-4">{gymInfo.emoji}</div>
      <h1 className="text-3xl md:text-5xl font-black leading-tight">
        COMPRÁ TUS CLASES.
        <br />
        <span style={{ color }}>ENTRÁ CON TU QR.</span>
      </h1>
      <p className="mt-3 font-semibold text-lg" style={{ color }}>{gymInfo.name}</p>
      <p className="mt-1 text-slate-400 text-sm">{gymInfo.tagline}</p>
      {gymInfo.address && (
        <p className="mt-2 text-slate-500 text-xs">📍 {gymInfo.address}</p>
      )}
    </section>
  );
}

// ── SECCIÓN DISCIPLINAS ───────────────────────────────────────────────────────
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
            style={{
              backgroundColor: "#111111",
              border: `1px solid ${color}30`,
              color: "#fff",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {d}
          </span>
        ))}
      </div>
    </section>
  );
}

// ── SECCIÓN HORARIOS ──────────────────────────────────────────────────────────
const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function HorariosSection({ schedule, color }) {
  if (!schedule?.length) return null;

  // Agrupar por hora
  const byTime = {};
  schedule.forEach((s) => {
    const key = `${s.time}__${s.class}`;
    if (!byTime[key]) byTime[key] = { time: s.time, class: s.class, color: s.color, days: [] };
    s.days.forEach((d) => {
      if (!byTime[key].days.includes(d)) byTime[key].days.push(d);
    });
  });

  const rows = Object.values(byTime).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section className="max-w-4xl mx-auto px-6 pb-10">
      <div className="text-xs font-black tracking-widest uppercase mb-4" style={{ color }}>
        Horarios
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: "560px",
            borderCollapse: "collapse",
            backgroundColor: "#0a0a0a",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #222" }}>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: color,
                  backgroundColor: "#0d0d0d",
                  whiteSpace: "nowrap",
                }}
              >
                HORA
              </th>
              {WEEK_DAYS.map((d) => (
                <th
                  key={d}
                  style={{
                    padding: "10px 14px",
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#64748b",
                    backgroundColor: "#0d0d0d",
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.toUpperCase().slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid #181818" }}
              >
                <td
                  style={{
                    padding: "9px 14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.time}
                </td>
                {WEEK_DAYS.map((day) => {
                  const has = row.days.includes(day);
                  return (
                    <td key={day} style={{ padding: "6px 8px", textAlign: "center" }}>
                      {has ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor: row.color,
                            color: row.color === "#F5C400" ? "#000" : "#fff",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.class.replace("Prep. Física ", "").replace("Deportiva", "Dep.").replace("Infantil", "Inf.")}
                        </span>
                      ) : (
                        <span style={{ color: "#222", fontSize: "11px" }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function GymPassTicketera() {
  const { gymId = "default" } = useParams();

  const [gymInfo, setGymInfo] = useState(null);
  const [gymLoading, setGymLoading] = useState(true);
  const [gymNotFound, setGymNotFound] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", payMethod: "Efectivo" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrMember, setQrMember] = useState(null);

  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupQr, setLookupQr] = useState(null);

  useEffect(() => {
    async function loadGym() {
      setGymLoading(true);
      try {
        const snap = await getDoc(doc(db, "gyms", gymId, "info", "data"));
        if (snap.exists()) {
          const data = snap.data();
          setGymInfo(data);
          const featured = data.plans?.find((p) => p.featured) || data.plans?.[1] || data.plans?.[0];
          if (featured) setSelectedPlan(featured.id);
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

  if (gymLoading) return <LoadingSkeleton />;
  if (gymNotFound) return <NotFound gymId={gymId} />;

  const theme = getGymTheme(gymInfo);
  const { primary: color, textOnPrimary } = theme;
  const plans = gymInfo.plans || [];
  const plan = plans.find((p) => p.id === selectedPlan) || plans[0];
  const isGoFuncional = gymId === "go-funcional";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError("Completá todos los campos.");
      return;
    }
    if (!plan) { setError("Seleccioná un plan."); return; }
    setLoading(true);
    try {
      const key = emailToKey(form.email);
      const ref = doc(db, "gyms", gymId, "members", key);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setQrMember(snap.data());
        setLoading(false);
        return;
      }
      const member = {
        id: "GP-" + randomId(),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        plan: { id: plan.id, name: plan.name },
        classesLeft: plan.classes,
        classesTotal: plan.classes,
        payMethod: form.payMethod,
        gymId,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, member);
      setQrMember(member);
    } catch (err) {
      setError("Error al guardar. Intentá de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div
      className="text-white min-h-screen font-sans"
      style={{ backgroundColor: isGoFuncional ? "#0d0d0d" : "#030712" }}
    >
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${color}15 1px, transparent 1px), linear-gradient(90deg, ${color}15 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* NavBar */}
      <nav
        className="sticky top-0 z-50 backdrop-blur border-b"
        style={{
          backgroundColor: isGoFuncional ? "rgba(13,13,13,0.92)" : "rgba(3,7,18,0.92)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <img src="/logo-hunterpass.png" alt="HunterPass" className="h-10 w-auto opacity-70" />
          <div className="w-px h-6 bg-white/10" />

          {isGoFuncional ? (
            <>
              <span className="font-black text-sm leading-none" style={{ color: "#F5C400", letterSpacing: "-0.5px" }}>
                GO!
              </span>
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
          <Link to="/pass/gym" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Gyms
          </Link>
        </div>

        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-6 pb-2 flex items-center gap-1 text-xs text-slate-600">
          <Link to="/" className="hover:text-slate-400 transition-colors">HunterPass</Link>
          <span>→</span>
          <Link to="/pass" className="hover:text-slate-400 transition-colors">Pases</Link>
          <span>→</span>
          <Link to="/pass/gym" className="hover:text-slate-400 transition-colors">Gyms</Link>
          <span>→</span>
          <span className="text-slate-400">{gymInfo.name}</span>
        </div>
      </nav>

      {/* Hero */}
      {isGoFuncional
        ? <GoHero gymInfo={gymInfo} color={color} />
        : <GenericHero gymInfo={gymInfo} color={color} />
      }

      {/* Cómo funciona */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-3 gap-4">
          {[
            { step: "01", title: "Elegís tu pack", desc: "Seleccioná la cantidad de clases que mejor se ajusta a tu rutina." },
            { step: "02", title: "Obtenés tu QR", desc: "Te generamos un pase QR único y personal de forma inmediata." },
            { step: "03", title: "Entrás con el QR", desc: "El operador escanea tu QR en la entrada y descuenta una clase." },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="border border-white/8 rounded-xl p-5 text-center"
              style={{ backgroundColor: isGoFuncional ? "#111" : "#0b1629" }}
            >
              <div className="text-2xl font-black mb-2" style={{ color: color + "60" }}>{step}</div>
              <h3 className="font-bold text-sm mb-1">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disciplinas (solo si el gym las tiene) */}
      <DisciplinasSection disciplines={gymInfo.disciplines} color={color} />

      {/* Horarios (solo si el gym los tiene) */}
      <HorariosSection schedule={gymInfo.schedule} color={color} />

      {/* Planes */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <div className="text-xs font-black tracking-widest uppercase mb-4" style={{ color }}>
          Elegí tu plan
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p, idx) => {
            const isSelected = selectedPlan === p.id;
            const isFeatured = p.featured || idx === 1;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className="relative text-left rounded-xl p-5 border transition-all"
                style={{
                  backgroundColor: isGoFuncional ? (isSelected ? "#1a1400" : "#111") : (isSelected ? color + "08" : "#0b1629"),
                  borderColor: isSelected ? color : "rgba(255,255,255,0.08)",
                  boxShadow: isSelected ? `0 8px 24px ${color}15` : "none",
                }}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ backgroundColor: color }} />
                )}
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={
                      isFeatured
                        ? { backgroundColor: color, color: textOnPrimary }
                        : { backgroundColor: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }
                    }
                  >
                    {isFeatured ? "⚡ Más elegido" : idx === 0 ? "Básico" : "Mensual"}
                  </span>
                  {isSelected && <span className="text-green-400 text-lg">✓</span>}
                </div>
                <h3 className="font-black text-lg">{p.name}</h3>
                <p className="font-bold text-xl mt-1" style={{ color }}>
                  ${p.price.toLocaleString("es-AR")}
                  <span className="text-slate-500 text-xs font-normal ml-1">ARS</span>
                </p>
                <p className="text-slate-400 text-sm mt-1">{p.classes} clases</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Formulario */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div
          className="border border-white/8 rounded-2xl p-7"
          style={{ backgroundColor: isGoFuncional ? "#111" : "#0b1629" }}
        >
          <div className="text-xs font-black tracking-widest uppercase mb-5" style={{ color }}>
            Tus datos
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="firstName" placeholder="Nombre" value={form.firstName} onChange={handleChange}
                className="p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none"
              />
              <input
                name="lastName" placeholder="Apellido" value={form.lastName} onChange={handleChange}
                className="p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none"
              />
            </div>
            <input
              name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none"
            />
            <input
              name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none"
            />
            <select
              name="payMethod" value={form.payMethod} onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
            >
              <option>Efectivo</option>
              <option>Transferencia</option>
              <option>Mercado Pago</option>
              <option>Tarjeta</option>
            </select>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-black py-4 rounded-xl text-base transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: color, color: textOnPrimary }}
            >
              {loading ? "Procesando..." : "OBTENER MI QR →"}
            </button>
          </form>
        </div>
      </section>

      {/* Consultar pase */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div
          className="border border-white/8 rounded-2xl p-7"
          style={{ backgroundColor: isGoFuncional ? "#111" : "#0b1629" }}
        >
          <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color }}>
            Consultá tu pase
          </div>
          <p className="text-slate-400 text-sm mb-5">Ingresá tu email para ver el estado de tus clases.</p>
          <div className="flex gap-3">
            <input
              type="email" placeholder="tu@email.com" value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="flex-1 p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none"
            />
            <button
              onClick={handleLookup} disabled={lookupLoading}
              className="px-5 bg-white/5 border border-white/15 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {lookupLoading ? "..." : "Buscar"}
            </button>
          </div>

          {lookupError && <p className="text-red-400 text-sm mt-3">{lookupError}</p>}

          {lookupResult && (
            <div className="mt-5 bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{lookupResult.firstName} {lookupResult.lastName}</h3>
                  <p className="text-slate-400 text-sm">{lookupResult.plan?.name}</p>
                </div>
                <button
                  onClick={() => setLookupQr(lookupResult)}
                  className="text-xs border px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                  style={{ color, borderColor: color + "40" }}
                >
                  Ver QR
                </button>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-black text-2xl" style={{ color }}>{lookupResult.classesLeft}</span>
                <span className="text-slate-500 text-sm">/ {lookupResult.classesTotal} clases disponibles</span>
              </div>
              <ClassBar left={lookupResult.classesLeft} total={lookupResult.classesTotal} color={color} />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8" style={{ backgroundColor: isGoFuncional ? "#0a0a0a" : "transparent" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo-hunterpass.png" alt="HunterPass" className="h-7 w-auto opacity-60" />
            {isGoFuncional ? (
              <div>
                <span className="font-black text-sm" style={{ color: "#F5C400" }}>GO! Funcional Gym</span>
                <p className="text-slate-500 text-xs">📍 Calle 9 e/ 24 y 26 — Navarro, Buenos Aires</p>
              </div>
            ) : (
              <span className="text-sm text-slate-500">{gymInfo.name} · GymPass</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {gymInfo.instagram && (
              <a
                href={gymInfo.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                @go_funcionalgym →
              </a>
            )}
            <Link to="/pass/gym" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
              ← Ver todos los gyms
            </Link>
          </div>
        </div>
      </footer>

      {qrMember && (
        <QRModal member={qrMember} gymId={gymId} gymColor={color} gymTextColor={textOnPrimary} onClose={() => setQrMember(null)} />
      )}
      {lookupQr && (
        <QRModal member={lookupQr} gymId={gymId} gymColor={color} gymTextColor={textOnPrimary} onClose={() => setLookupQr(null)} />
      )}
    </div>
  );
}
