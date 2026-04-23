import { useState, useEffect, useRef, useCallback, Component } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.error("ErrorBoundary:", e, info); }
  render() {
    if (this.state.error) {
      const e = this.state.error;
      const msg = e?.message || String(e) || "sin mensaje";
      const stack = e?.stack?.slice(0, 300) || "";
      return (
        <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-4 text-red-400">
          <p className="font-bold mb-2 text-sm">Error de render:</p>
          <pre className="text-xs whitespace-pre-wrap break-all mb-2">{msg}</pre>
          <pre className="text-xs whitespace-pre-wrap break-all opacity-60">{stack}</pre>
          <button onClick={() => this.setState({ error: null })} className="mt-4 px-4 py-2 bg-red-500/30 rounded-xl text-sm">
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const CREDENTIALS = {
  admin: { password: "admin123", role: "admin", label: "Administrador" },
  operador: { password: "gym2024", role: "operator", label: "Operador" },
};

function emailToKey(email) {
  return email.toLowerCase().replace(/\./g, "_").replace(/@/g, "--");
}

function randomId(len = 6) {
  return Math.random().toString(36).toUpperCase().slice(2, 2 + len);
}

function isToday(ts) {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function handle(e) {
    e.preventDefault();
    const cred = CREDENTIALS[user.toLowerCase().trim()];
    if (cred && cred.password === pass) {
      onLogin({ username: user.toLowerCase().trim(), ...cred });
    } else {
      setErr("Credenciales incorrectas.");
    }
  }

  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans flex flex-col items-center justify-center px-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo-hunterpass.png" alt="HunterPass" className="h-14 w-auto mx-auto mb-4 opacity-90" />
          <h1 className="font-black text-xl tracking-wide">GYMPASS · Panel Interno</h1>
          <p className="text-slate-400 text-sm mt-1">Acceso restringido para operadores autorizados</p>
        </div>

        <form onSubmit={handle} className="bg-[#0b1629] border border-white/10 rounded-2xl p-7 space-y-4">
          <input
            placeholder="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value.trim())}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            spellCheck={false}
            className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="current-password"
            spellCheck={false}
            className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button
            type="submit"
            className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black py-3 rounded-xl text-sm transition-colors"
          >
            Ingresar →
          </button>
        </form>

        <p className="text-center mt-6">
          <Link to="/" className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── CLASS METER ───────────────────────────────────────────────────────────────
function ClassMeter({ left, total }) {
  const pct = total > 0 ? (left / total) * 100 : 0;
  const color = pct > 50 ? "text-cyan-400" : pct > 25 ? "text-amber-400" : "text-red-400";
  const barColor = pct > 50 ? "bg-cyan-400" : pct > 25 ? "bg-amber-400" : "bg-red-500";
  return (
    <div>
      <p className={`text-5xl font-black ${color}`}>{left}</p>
      <p className="text-slate-400 text-sm mb-2">/ {total} clases</p>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── SCANNER TAB ────────────────────────────────────────────────────────────────
function ScannerTab({ gymId, operator }) {
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(null);
  const [accrediting, setAccrediting] = useState(false);
  const [accreditMsg, setAccreditMsg] = useState("");
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const resultRef = useRef(null);

  const processQR = useCallback(async (text) => {
    setAccreditMsg("");
    try {
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = { email: text, id: text }; }

      const key = parsed.email ? emailToKey(parsed.email) : parsed.id;
      setResultKey(key);
      const snap = await getDoc(doc(db, "gyms", gymId, "members", key));
      if (snap.exists()) {
        setResult({ status: "found", data: snap.data() });
      } else {
        setResult({ status: "notfound", raw: text });
      }
    } catch (e) {
      console.error("processQR error:", e);
      setResult({ status: "error", msg: e?.code || e?.message || "Error desconocido" });
    }
  }, [gymId]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => {
    if (!scanning) {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current = null;
      }
      return;
    }

    function startScanner() {
      if (!window.Html5Qrcode) return;
      const scanner = new window.Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (text) => { console.log("QR scanned:", text); setManualInput(text); processQR(text); scanner.stop(); setScanning(false); },
        () => {}
      ).catch(() => setScanning(false));
    }

    if (window.Html5Qrcode) {
      startScanner();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.onload = startScanner;
      document.head.appendChild(script);
    }

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current = null;
      }
    };
  }, [scanning, processQR]);

  async function accredit() {
    if (!result?.data || result.data.classesLeft <= 0) return;
    setAccrediting(true);
    try {
      const member = result.data;
      const newLeft = member.classesLeft - 1;
      await setDoc(doc(db, "gyms", gymId, "members", resultKey), { classesLeft: newLeft }, { merge: true });
      await addDoc(collection(db, "gyms", gymId, "logs"), {
        userId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        plan: member.plan?.name,
        classesLeft: newLeft,
        classesTotal: member.classesTotal,
        operator: operator.username,
        time: serverTimestamp(),
      });
      setResult((r) => ({ ...r, data: { ...r.data, classesLeft: newLeft } }));
      setAccreditMsg("✓ Clase acreditada correctamente");
    } catch (e) {
      console.error("accredit error:", e);
      setAccreditMsg(`Error al acreditar: ${e?.code || e?.message || "intentá de nuevo"}`);
    } finally {
      setAccrediting(false);
    }
  }

  const classesLeft = result?.data?.classesLeft ?? 0;
  const statusColor = result?.status === "found"
    ? classesLeft > 0 ? "border-green-500/50 bg-green-500/5" : "border-amber-400/50 bg-amber-400/5"
    : result?.status === "notfound" ? "border-red-500/50 bg-red-500/5" : "";

  const bannerColor = result?.status === "found"
    ? classesLeft > 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-amber-400/20 text-amber-400 border-amber-400/30"
    : result?.status === "notfound" ? "bg-red-500/20 text-red-400 border-red-500/30" : "";

  const bannerText = result?.status === "found"
    ? classesLeft > 0 ? "✓ Miembro verificado" : "⚠ Sin clases disponibles"
    : result?.status === "notfound" ? "✗ Miembro no encontrado" : "";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Cámara */}
      <div className="bg-[#0b1629] border border-white/8 rounded-2xl p-6">
        <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-4">Escáner QR</div>

        <div
          id="qr-reader"
          className={`w-full aspect-square rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-4 overflow-hidden ${scanning ? "" : "cursor-pointer"}`}
          onClick={() => !scanning && setScanning(true)}
        >
          {!scanning && (
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">Clic para activar cámara</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setScanning((s) => !s)}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-colors mb-4 ${
            scanning
              ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
              : "bg-cyan-400 hover:bg-cyan-300 text-black"
          }`}
        >
          {scanning ? "■ DETENER" : "▶ INICIAR ESCÁNER"}
        </button>

        <div className="flex gap-2">
          <input
            placeholder="ID o email manual"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && processQR(manualInput)}
            className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
          />
          <button
            onClick={() => processQR(manualInput)}
            className="px-4 bg-white/5 border border-white/15 text-white rounded-xl text-sm hover:bg-white/10 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Resultado */}
      <div ref={resultRef} className={`bg-[#0b1629] border rounded-2xl p-6 transition-all ${result ? statusColor : "border-white/8"}`}>
        <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-4">Resultado</div>

        {!result && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600">
            <div className="text-4xl mb-2">◎</div>
            <p className="text-sm">Esperando escaneo...</p>
          </div>
        )}

        {result?.status === "error" && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 mb-4">
            ✗ Error al leer miembro: {result.msg}
          </div>
        )}

        {result?.status === "notfound" && (
          <div className={`border rounded-xl px-4 py-3 text-sm font-semibold mb-4 ${bannerColor}`}>
            {bannerText}
          </div>
        )}

        {result?.status === "found" && (
          <>
            <div className={`border rounded-xl px-4 py-3 text-sm font-semibold mb-4 ${bannerColor}`}>
              {bannerText}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-xl font-black text-cyan-400">
                {result.data.firstName?.[0]}{result.data.lastName?.[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg">{result.data.firstName} {result.data.lastName}</h3>
                <p className="text-slate-400 text-sm">{result.data.email}</p>
                <p className="text-xs text-slate-500">{result.data.id}</p>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 mb-2">{result.data?.plan?.name}</p>
              <ClassMeter left={result.data?.classesLeft ?? 0} total={result.data?.classesTotal ?? 0} />
            </div>

            {accreditMsg && (
              <p className={`text-sm mb-3 ${accreditMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                {accreditMsg}
              </p>
            )}

            <button
              onClick={accredit}
              disabled={classesLeft <= 0 || accrediting}
              className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors"
            >
              {accrediting ? "Acreditando..." : "✓ ACREDITAR CLASE"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── MEMBERS TAB ───────────────────────────────────────────────────────────────
function MembersTab({ gymId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [newMember, setNewMember] = useState({ firstName: "", lastName: "", email: "", plan: "regular" });
  const [saving, setSaving] = useState(false);

  async function loadMembers() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "gyms", gymId, "members"));
      setMembers(snap.docs.map((d) => ({ _key: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMembers(); }, [gymId]);

  async function recharge(key, total) {
    await setDoc(doc(db, "gyms", gymId, "members", key), { classesLeft: total }, { merge: true });
    setMembers((ms) => ms.map((m) => m._key === key ? { ...m, classesLeft: total } : m));
  }

  async function remove(key) {
    if (!confirm("¿Eliminar este miembro?")) return;
    await deleteDoc(doc(db, "gyms", gymId, "members", key));
    setMembers((ms) => ms.filter((m) => m._key !== key));
  }

  const PLAN_MAP = { basico: { name: "Pack Básico", classes: 10 }, regular: { name: "Pack Regular", classes: 12 }, ilimitado: { name: "Sin Límite", classes: 20 } };

  async function saveNew(e) {
    e.preventDefault();
    if (!newMember.firstName || !newMember.lastName || !newMember.email) return;
    setSaving(true);
    try {
      const plan = PLAN_MAP[newMember.plan];
      const key = emailToKey(newMember.email);
      const member = {
        id: "GP-" + randomId(),
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        plan: { id: newMember.plan, name: plan.name },
        classesLeft: plan.classes,
        classesTotal: plan.classes,
        gymId,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "gyms", gymId, "members", key), member);
      setShowModal(false);
      setNewMember({ firstName: "", lastName: "", email: "", plan: "regular" });
      await loadMembers();
    } finally {
      setSaving(false);
    }
  }

  const plans = ["Todos", ...new Set(members.map((m) => m.plan?.name).filter(Boolean))];
  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(q);
    const matchPlan = planFilter === "Todos" || m.plan?.name === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 p-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
        >
          {plans.map((p) => <option key={p}>{p}</option>)}
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-colors"
        >
          + NUEVO MIEMBRO
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Cargando miembros...</p>
      ) : (
        <div className="bg-[#0b1629] border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-widest">
                <th className="text-left p-4">Nombre / Email</th>
                <th className="text-left p-4">Plan</th>
                <th className="text-left p-4">Clases</th>
                <th className="text-left p-4">Pago</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m._key} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="font-semibold">{m.firstName} {m.lastName}</div>
                    <div className="text-slate-400 text-xs">{m.email}</div>
                  </td>
                  <td className="p-4 text-slate-300">{m.plan?.name || "—"}</td>
                  <td className="p-4">
                    <span className={`font-bold ${m.classesLeft <= 0 ? "text-red-400" : "text-cyan-400"}`}>
                      {m.classesLeft}
                    </span>
                    <span className="text-slate-500">/{m.classesTotal}</span>
                    {m.classesLeft <= 0 && (
                      <span className="ml-2 text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                        RECARGA
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 text-xs">{m.payMethod || "—"}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => recharge(m._key, m.classesTotal)}
                        className="text-xs px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/20 transition-colors"
                      >
                        Recargar
                      </button>
                      <button
                        onClick={() => remove(m._key)}
                        className="text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#0b1629] border border-white/10 rounded-2xl p-7 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black text-lg mb-5">Nuevo miembro</h3>
            <form onSubmit={saveNew} className="space-y-3">
              <input placeholder="Nombre" value={newMember.firstName} onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50" />
              <input placeholder="Apellido" value={newMember.lastName} onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50" />
              <input placeholder="Email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50" />
              <select value={newMember.plan} onChange={(e) => setNewMember({ ...newMember, plan: e.target.value })}
                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none">
                <option value="basico">Pack Básico (10 clases)</option>
                <option value="regular">Pack Regular (12 clases)</option>
                <option value="ilimitado">Sin Límite (20 clases)</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm transition-colors">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl text-sm hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LOGS TAB ──────────────────────────────────────────────────────────────────
function LogsTab({ gymId, memberCount }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "gyms", gymId, "logs"), orderBy("time", "desc")));
        setLogs(snap.docs.map((d) => ({ _id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [gymId]);

  const todayLogs = logs.filter((l) => isToday(l.time));
  const zeroLeft = logs.filter((l) => l.classesLeft <= 0).length;

  const stats = [
    { label: "Miembros totales", value: memberCount },
    { label: "Acreditaciones hoy", value: todayLogs.length },
    { label: "Sin clases", value: zeroLeft },
    { label: "Histórico total", value: logs.length },
  ];

  function formatTime(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-[#0b1629] border border-white/8 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-cyan-400">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-3">Acreditaciones de hoy</div>
        {loading ? (
          <p className="text-slate-500 text-sm">Cargando...</p>
        ) : (
          <div className="bg-[#0b1629] border border-white/8 rounded-2xl overflow-hidden">
            {todayLogs.length === 0 ? (
              <p className="p-8 text-center text-slate-500 text-sm">Sin acreditaciones hoy.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {todayLogs.map((log) => (
                  <div key={log._id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <span className="font-semibold text-sm">{log.name}</span>
                      <span className="text-slate-400 text-xs ml-2">{log.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-xs text-slate-500">{log.plan}</span>
                      <span className="text-xs text-cyan-400 font-semibold">{log.classesLeft} restantes</span>
                      <span className="text-xs text-slate-500">{formatTime(log.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PAGOS TAB ─────────────────────────────────────────────────────────────────
function PagosTab({ gymId, gymInfo, gymColor }) {
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sincronizar cuando gymInfo carga (es async)
  useEffect(() => {
    if (gymInfo?.plans?.length) {
      setPlans(gymInfo.plans.map((p) => ({ ...p, mpLink: p.mpLink || "" })));
    }
  }, [gymInfo]);

  // Aviso si gymId no corresponde a un gym real
  if (!gymInfo && gymId === "default") {
    return (
      <div className="max-w-2xl">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
          <p className="font-bold text-amber-400 mb-2">⚠ Gym no identificado</p>
          <p className="text-slate-400 text-sm mb-4">
            Estás en <code className="text-white">/panel/gym</code> sin un gym específico.
            Para gestionar los pagos de un gym, entrá a la URL con el ID del gym:
          </p>
          <code className="block bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-cyan-400 text-sm">
            /panel/gym/go-funcional
          </code>
        </div>
      </div>
    );
  }

  if (!gymInfo) {
    return <p className="text-slate-500 text-sm">Cargando información del gym...</p>;
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "gyms", gymId), { plans }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function setLink(idx, val) {
    setPlans((ps) => ps.map((p, i) => i === idx ? { ...p, mpLink: val } : p));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-black text-lg mb-1">Links de pago — Mercado Pago</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Pegá el link de pago de Mercado Pago para cada plan. Los clientes serán redirigidos
          a ese link al hacer click en "Pagar". Generá los links desde tu panel de MP en{" "}
          <a href="https://www.mercadopago.com.ar/cobros" target="_blank" rel="noreferrer" className="underline" style={{ color: gymColor }}>
            mercadopago.com.ar/cobros
          </a>
          .
        </p>
      </div>

      <div className="space-y-4">
        {plans.map((p, idx) => (
          <div key={p.id} className="bg-[#0b1629] border border-white/8 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-white">{p.name}</span>
                <span className="text-slate-500 text-sm ml-2">· {p.classes} clases · ${p.price?.toLocaleString("es-AR")} ARS</span>
              </div>
              {p.mpLink ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: gymColor + "20", color: gymColor, border: `1px solid ${gymColor}40` }}>
                  ✓ Configurado
                </span>
              ) : (
                <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  Sin link
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                placeholder="https://link.mercadopago.com.ar/tu-gym"
                value={p.mpLink}
                onChange={(e) => setLink(idx, e.target.value)}
                className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none"
                style={{ focusBorderColor: gymColor }}
              />
              {p.mpLink && (
                <a
                  href={p.mpLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 flex items-center text-xs bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  Probar →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 font-black text-sm rounded-xl transition-all hover:brightness-110 disabled:opacity-50"
          style={{ backgroundColor: gymColor, color: "#000" }}
        >
          {saving ? "Guardando..." : "Guardar links"}
        </button>
        {saved && (
          <span className="text-green-400 text-sm font-semibold">✓ Guardado correctamente</span>
        )}
      </div>

      <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5 text-sm text-slate-400 space-y-2">
        <p className="font-semibold text-white text-xs tracking-widest uppercase">Cómo generar el link en MP</p>
        <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
          <li>Entrá a <strong className="text-white">mercadopago.com.ar/cobros</strong></li>
          <li>Seleccioná <strong className="text-white">Cobrar con link</strong></li>
          <li>Creá un link por cada plan con el precio exacto</li>
          <li>Copiá el link y pegalo en el campo de arriba</li>
          <li>Guardá los cambios</li>
        </ol>
      </div>
    </div>
  );
}

// ── GYM SELECTOR ─────────────────────────────────────────────────────────────
function GymSelector({ operator, onLogout }) {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "gyms"));
        setGyms(snap.docs.map((d) => d.data()).filter((g) => g.active));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(34,211,238,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.02) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <img src="/logo-hunterpass.png" alt="HunterPass" className="h-10 w-auto opacity-80" />
          <div className="w-px h-6 bg-white/10" />
          <span className="font-black text-white text-sm tracking-widest">Panel Interno</span>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">{operator.label}</span>
            <button
              onClick={onLogout}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 border border-white/10 rounded-full hover:border-red-400/30"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-3">Panel de operadores</div>
          <h1 className="text-3xl font-black">Seleccioná un gym</h1>
          <p className="text-slate-400 mt-2 text-sm">Elegí el gym que querés administrar</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : gyms.length === 0 ? (
          <p className="text-center text-slate-500">No hay gyms disponibles.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {gyms.map((gym) => (
              <Link
                key={gym.id}
                to={`/panel/gym/${gym.id}`}
                className="group block bg-[#0b1629] border border-white/8 rounded-2xl p-6 hover:border-white/20 transition-all hover:-translate-y-0.5"
                style={{ "--gym-color": gym.color }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                    style={{ backgroundColor: gym.color + "20", color: gym.color, fontSize: gym.emoji?.length > 2 ? "14px" : "28px" }}
                  >
                    {gym.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-base">{gym.name}</h3>
                    <p className="text-slate-400 text-sm truncate">{gym.tagline}</p>
                    <p className="text-slate-600 text-xs mt-0.5">📍 {gym.address}</p>
                  </div>
                  <span className="text-slate-500 group-hover:text-white transition-colors text-xl">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ── MAIN PANEL ─────────────────────────────────────────────────────────────────
export default function GymPassPanel() {
  const { gymId = "default" } = useParams();
  const [operator, setOperator] = useState(null);
  const [tab, setTab] = useState("scanner");
  const [memberCount, setMemberCount] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [gymInfo, setGymInfo] = useState(null);

  useEffect(() => {
    async function loadGymInfo() {
      try {
        const snap = await getDoc(doc(db, "gyms", gymId));
        if (snap.exists()) setGymInfo(snap.data());
      } catch {}
    }
    loadGymInfo();
  }, [gymId]);

  useEffect(() => {
    if (!operator) return;
    async function loadCounts() {
      const [membersSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, "gyms", gymId, "members")),
        getDocs(collection(db, "gyms", gymId, "logs")),
      ]);
      setMemberCount(membersSnap.size);
      const today = logsSnap.docs.filter((d) => isToday(d.data().time)).length;
      setLogCount(today);
    }
    loadCounts();
  }, [operator, gymId]);

  if (!operator) return <LoginScreen onLogin={setOperator} />;

  // Sin gymId específico → mostrar selector de gyms
  if (gymId === "default") return <GymSelector operator={operator} onLogout={() => setOperator(null)} />;

  const gymColor = gymInfo?.color || "#22d3ee";

  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${gymColor}15 1px, transparent 1px), linear-gradient(90deg, ${gymColor}15 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <img src="/logo-hunterpass.png" alt="HunterPass" className="h-10 w-auto opacity-80" />
          <div className="w-px h-6 bg-white/10" />
          {gymInfo && <span className="text-lg">{gymInfo.emoji}</span>}
          <span className="font-black text-white text-sm tracking-widest hidden sm:block">
            {gymInfo ? gymInfo.name : "GYMPASS"} · Panel Interno
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: gymColor }}
              />
              <span className="text-xs text-slate-300 font-semibold">{operator.label}</span>
            </div>
            <button
              onClick={() => setOperator(null)}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 border border-white/10 rounded-full hover:border-red-400/30"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5 bg-[#030712]/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: "scanner", label: "📷 Escanear QR" },
              { id: "members", label: `👥 Miembros (${memberCount})` },
              { id: "logs", label: `📊 Registro (${logCount} hoy)` },
              { id: "pagos", label: "💳 Pagos" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="px-5 py-4 text-sm font-semibold border-b-2 transition-colors"
                style={
                  tab === id
                    ? { borderColor: gymColor, color: gymColor }
                    : { borderColor: "transparent", color: "#94a3b8" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "scanner" && <ErrorBoundary><ScannerTab gymId={gymId} operator={operator} /></ErrorBoundary>}
        {tab === "members" && <MembersTab gymId={gymId} />}
        {tab === "logs" && <LogsTab gymId={gymId} memberCount={memberCount} />}
        {tab === "pagos" && <PagosTab gymId={gymId} gymInfo={gymInfo} gymColor={gymColor} />}
      </main>
    </div>
  );
}
