import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const PLANS = [
  { id: "basico", name: "Pack Básico", classes: 10, price: 4500, tag: "Básico", highlight: false },
  { id: "regular", name: "Pack Regular", classes: 12, price: 5200, tag: "⚡ Más elegido", highlight: true },
  { id: "ilimitado", name: "Sin Límite", classes: 20, price: 7800, tag: "Mensual", highlight: false },
];

function randomId(len = 6) {
  return Math.random().toString(36).toUpperCase().slice(2, 2 + len);
}

function emailToKey(email) {
  return email.toLowerCase().replace(/\./g, "_").replace(/@/g, "--");
}

function ClassBar({ left, total }) {
  const pct = total > 0 ? (left / total) * 100 : 0;
  const color = pct > 50 ? "bg-cyan-400" : pct > 25 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="w-full bg-white/10 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function QRModal({ member, gymId, onClose }) {
  const qrRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = "";

    const data = JSON.stringify({ id: member.id, email: member.email, gymId, v: 1 });

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => {
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
    };
    if (!window.QRCode) {
      document.head.appendChild(script);
    } else {
      script.onload();
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
        className="bg-[#0b1629] border border-cyan-400/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl shadow-cyan-400/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-1">Tu GymPass</div>
        <h3 className="font-black text-xl mb-1">{member.firstName} {member.lastName}</h3>
        <p className="text-slate-400 text-sm mb-2">{member.plan?.name}</p>
        <p className="text-cyan-400 font-bold text-lg mb-4">
          {member.classesLeft} <span className="text-slate-400 font-normal text-sm">/ {member.classesTotal} clases</span>
        </p>

        <div className="flex justify-center mb-6">
          <div ref={qrRef} className="bg-white p-3 rounded-xl inline-block" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={downloadQR}
            className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
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

export default function GymPassTicketera() {
  const { gymId = "default" } = useParams();

  const [selectedPlan, setSelectedPlan] = useState("regular");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", payMethod: "Efectivo" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrMember, setQrMember] = useState(null);

  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupQr, setLookupQr] = useState(null);

  const plan = PLANS.find((p) => p.id === selectedPlan);

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
    <div className="bg-[#030712] text-white min-h-screen font-sans">
      {/* Grid bg */}
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
          <img src="/logo-hunterpass.png" alt="HunterPass" className="h-10 w-auto opacity-80" />
          <div className="w-px h-6 bg-white/10" />
          <span className="font-black text-white tracking-widest text-sm">GYMPASS</span>
          <span className="text-xs bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 px-2 py-0.5 rounded-full font-semibold">
            BETA
          </span>
          <div className="flex-1" />
          <Link to="/pass" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            ← Plataforma
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-black leading-tight">
          COMPRÁ TUS CLASES.
          <br />
          <span className="text-cyan-400">ENTRÁ CON TU QR.</span>
        </h1>
        <p className="mt-4 text-slate-400">Pack de clases para gimnasio con pase QR personal e intransferible.</p>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-3 gap-4">
          {[
            { step: "01", title: "Elegís tu pack", desc: "Seleccioná la cantidad de clases que mejor se ajusta a tu rutina." },
            { step: "02", title: "Obtenés tu QR", desc: "Te generamos un pase QR único y personal de forma inmediata." },
            { step: "03", title: "Entrás con el QR", desc: "El operador escanea tu QR en la entrada y descuenta una clase." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-[#0b1629] border border-white/8 rounded-xl p-5 text-center">
              <div className="text-2xl font-black text-cyan-400/40 mb-2">{step}</div>
              <h3 className="font-bold text-sm mb-1">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planes */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-4">Elegí tu plan</div>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`relative text-left rounded-xl p-5 border transition-all ${
                selectedPlan === p.id
                  ? "border-cyan-400 bg-cyan-400/5 shadow-lg shadow-cyan-400/10"
                  : "border-white/10 bg-[#0b1629] hover:border-white/20"
              }`}
            >
              {selectedPlan === p.id && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t-xl" />
              )}
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    p.highlight
                      ? "bg-cyan-400 text-black"
                      : "bg-white/5 border border-white/10 text-slate-400"
                  }`}
                >
                  {p.tag}
                </span>
                {selectedPlan === p.id && (
                  <span className="text-green-400 text-lg">✓</span>
                )}
              </div>
              <h3 className="font-black text-lg">{p.name}</h3>
              <p className="text-cyan-400 font-bold text-xl mt-1">
                ${p.price.toLocaleString("es-AR")}
                <span className="text-slate-500 text-xs font-normal ml-1">ARS</span>
              </p>
              <p className="text-slate-400 text-sm mt-1">{p.classes} clases</p>
            </button>
          ))}
        </div>
      </section>

      {/* Formulario */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-[#0b1629] border border-white/8 rounded-2xl p-7">
          <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-5">Tus datos</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="firstName"
                placeholder="Nombre"
                value={form.firstName}
                onChange={handleChange}
                className="p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
              />
              <input
                name="lastName"
                placeholder="Apellido"
                value={form.lastName}
                onChange={handleChange}
                className="p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
            />
            <input
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
            />
            <select
              name="payMethod"
              value={form.payMethod}
              onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400/50"
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
              className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-black py-4 rounded-xl text-base transition-colors"
            >
              {loading ? "Procesando..." : "OBTENER MI QR →"}
            </button>
          </form>
        </div>
      </section>

      {/* Consultar pase */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-[#0b1629] border border-white/8 rounded-2xl p-7">
          <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-2">Consultá tu pase</div>
          <p className="text-slate-400 text-sm mb-5">Ingresá tu email para ver el estado de tus clases.</p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="tu@email.com"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="flex-1 p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
            />
            <button
              onClick={handleLookup}
              disabled={lookupLoading}
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
                  className="text-xs text-cyan-400 border border-cyan-400/30 px-3 py-1.5 rounded-lg hover:bg-cyan-400/10 transition-colors"
                >
                  Ver QR
                </button>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-black text-2xl text-cyan-400">{lookupResult.classesLeft}</span>
                <span className="text-slate-500 text-sm">/ {lookupResult.classesTotal} clases disponibles</span>
              </div>
              <ClassBar left={lookupResult.classesLeft} total={lookupResult.classesTotal} />
            </div>
          )}
        </div>
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

      {/* QR Modal al generar */}
      {qrMember && <QRModal member={qrMember} gymId={gymId} onClose={() => setQrMember(null)} />}
      {lookupQr && <QRModal member={lookupQr} gymId={gymId} onClose={() => setLookupQr(null)} />}
    </div>
  );
}
