import { useMemo, useState } from "react";

const WA_NUMBER = "5491166242165";

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#070f1f]/80 backdrop-blur border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-hunterpass.png" alt="HunterPass" className="h-14 w-auto" />
          <div className="hidden sm:block">
            <div className="font-black text-white text-sm tracking-wider">HUNTERPASS</div>
            <div className="text-slate-400 text-xs">Control de accesos y experiencias inteligentes</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#servicios" className="hover:text-cyan-400 transition-colors">Servicios</a>
          <a href="#porqueHP" className="hover:text-cyan-400 transition-colors">Por qué HunterPass</a>
          <a href="#paquetes" className="hover:text-cyan-400 transition-colors">Paquetes</a>
        </div>
        <a
          href="#contacto"
          className="px-5 py-2 bg-cyan-400 text-black font-bold rounded-lg text-sm hover:bg-cyan-300 transition-colors"
        >
          Contactar
        </a>
      </div>
    </nav>
  );
}

function PanelMockup() {
  return (
    <div className="bg-[#0b1629] border border-cyan-400/20 rounded-2xl p-5 w-full max-w-sm shadow-2xl shadow-cyan-400/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase">Panel Hunter</div>
          <div className="text-white font-bold text-lg mt-0.5">Evento en vivo</div>
        </div>
        <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
          Online
        </span>
      </div>
      <div className="space-y-2.5">
        {[
          ["Acreditados", "184"],
          ["Ingresos validados", "162"],
          ["Activaciones registradas", "327"],
          ["Alertas / duplicados", "2"],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-4 py-2.5">
            <span className="text-slate-300 text-sm">{label}</span>
            <span className={`font-black text-base ${label === "Alertas / duplicados" ? "text-amber-400" : "text-cyan-400"}`}>
              {val}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-4 leading-relaxed">
        Monitoreo en tiempo real para ingresos, estaciones, activaciones y trazabilidad completa del asistente.
      </p>
    </div>
  );
}

export default function App() {
  const [formData, setFormData] = useState({
    nombre: "", empresa: "", contacto: "", tipoEvento: "", asistentes: "", mensaje: "",
  });

  const mensajeWhatsapp = useMemo(() => {
    const lineas = [
      "Hola HunterPass, quiero recibir una propuesta comercial.",
      `Nombre: ${formData.nombre || "-"}`,
      `Empresa / Marca: ${formData.empresa || "-"}`,
      `Contacto: ${formData.contacto || "-"}`,
      `Tipo de evento: ${formData.tipoEvento || "-"}`,
      `Cantidad estimada de asistentes: ${formData.asistentes || "-"}`,
      `Detalle del evento: ${formData.mensaje || "-"}`,
    ];
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lineas.join("\n"))}`;
  }, [formData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans">
      <NavBar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#030712] to-[#000d1a]" />
        <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div>
            {/* Logo grande en hero */}
            <img
              src="/logo-hunterpass.png"
              alt="HunterPass"
              className="w-48 md:w-64 mb-8 drop-shadow-[0_0_40px_rgba(34,211,238,0.5)] filter brightness-110"
            />

            <div className="inline-block bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              Tecnología de acceso inteligente para eventos
            </div>

            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              <span className="text-white">HUNTERPASS</span>
              <br />
              <span className="text-cyan-400">Hacé que tu evento<br />se vea serio antes<br />de que arranque.</span>
            </h1>

            <p className="mt-5 text-slate-400 leading-relaxed">
              Acreditación digital, QR, NFC y RFID para eventos que necesitan orden,
              velocidad y datos concretos. Menos improvisación, menos filas y mucho más control.
            </p>

            <div className="mt-4 bg-white/[0.04] border border-white/10 rounded-xl p-4 text-sm text-slate-400">
              Soluciones para acreditación, acceso y trazabilidad en tiempo real para eventos,
              activaciones y experiencias de marca.
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href="#contacto"
                className="px-7 py-3.5 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-colors"
              >
                Quiero una propuesta ahora
              </a>
              <a
                href="#paquetes"
                className="px-7 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
              >
                Ver paquetes
              </a>
            </div>

            <div className="flex gap-8 mt-10">
              {[["QR", "Ingreso ágil"], ["NFC", "Experiencia premium"], ["DATA", "Métricas reales"]].map(([tech, label]) => (
                <div key={tech} className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3">
                  <div className="font-black text-white">{tech}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <PanelMockup />
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="px-6 py-24 max-w-6xl mx-auto">
        <div className="mb-14">
          <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Servicios</div>
          <h2 className="text-3xl md:text-4xl font-black max-w-2xl">
            No improvises el acceso. Convertí tu evento en una operación seria.
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl">
            Implementamos herramientas de acceso y control para eventos que necesitan velocidad, orden
            y datos claros en cada punto de ingreso.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              tag: "Acceso",
              title: "Control de Accesos",
              desc: "Check-in y check-out en tiempo real. Control de reingresos (bloqueados o permitidos), validación por QR o NFC y estados por asistente: dentro / fuera / pendiente.",
              detail: "Resuelve el caos de '¿quién está adentro realmente?'",
              features: ["Check-in / Check-out", "Control de reingresos", "QR + NFC", "Estado en tiempo real"],
            },
            {
              tag: "Registro",
              title: "Acreditación Digital",
              desc: "Base de datos de asistentes cargada manual o por CSV. Cada persona asociada a un QR o pulsera NFC. Identificación rápida en puerta. Ideal para corporativos y VIP.",
              detail: "De listas en papel a control profesional.",
              features: ["Importación CSV", "QR individual", "Pulsera NFC/RFID", "Base exportable"],
            },
            {
              tag: "Seguimiento",
              title: "Tracking en Vivo",
              desc: "Registro de cada escaneo, historial de movimientos por asistente, control por sectores (VIP, backstage, general) y datos en tiempo real para tomar decisiones.",
              detail: "Le das al cliente información, no solo acceso.",
              features: ["Historial de movimientos", "Control por sector", "Datos en tiempo real", "Alertas de duplicado"],
            },
            {
              tag: "Experiencia",
              title: "Activaciones & Gamificación",
              desc: "Estaciones NFC distribuidas por el evento. Cada asistente valida su paso por cada punto. Progreso en vivo (ej: 3/4 completado), pantalla con ranking y ganador.",
              detail: "Convertís el evento en una experiencia, no solo una entrada.",
              features: ["Estaciones NFC", "Progreso por asistente", "Ranking en vivo", "Pantalla pública"],
            },
            {
              tag: "Pagos",
              title: "Cashless — Consumos con NFC",
              desc: "Sistema de pagos asociado a cada pulsera. Saldo cargado en sistema o en chip. Historial de compras por usuario. Reducción total de efectivo en el evento.",
              detail: "Nivel festival grande. Acá está el negocio fuerte.",
              features: ["Saldo por pulsera", "Historial de consumo", "Sin efectivo", "Recarga en caja"],
            },
            {
              tag: "Panel",
              title: "Dashboard en Vivo",
              desc: "Pantalla de monitoreo para mostrar en tiempo real: aforo actual, progreso de activaciones, alertas operativas y métricas clave. Pensado para TV en el evento.",
              detail: "Impacto visual y control operativo desde una sola pantalla.",
              features: ["Aforo en tiempo real", "Alertas y bloqueos", "Para TV / pantalla grande", "Multi-punto"],
            },
            {
              tag: "Sistema",
              title: "Backend / Gestión del Evento",
              desc: "El cerebro del sistema. Carga y edición de invitados, importación CSV, administración de accesos y configuración de sectores antes y durante el evento.",
              detail: "Todo ordenado antes del evento = evento sin problemas.",
              features: ["Carga de invitados", "Importación CSV", "Edición en vivo", "Sectores y permisos"],
            },
            {
              tag: "Lectura",
              title: "Grabado y Lectura de Tags NFC",
              desc: "Servicio de grabado masivo de pulseras y tags NFC con la información del asistente o UID único. Compatible con distintos formatos: pulseras textiles, plástico, tarjetas.",
              detail: "Hardware y preparación lista para el día del evento.",
              features: ["Grabado masivo", "Pulseras textiles / plástico", "Tarjetas NFC", "Compatibilidad RFID"],
            },
          ].map(({ tag, title, desc, detail, features }) => (
            <div
              key={title}
              className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 hover:border-cyan-400/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs text-cyan-400 font-semibold tracking-widest uppercase">{tag}</span>
                  <h3 className="text-xl font-bold mt-1">{title}</h3>
                </div>
                <div className="w-1 h-8 bg-cyan-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              <p className="text-cyan-400/70 text-xs mt-3 italic">&ldquo;{detail}&rdquo;</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {features.map((f) => (
                  <span key={f} className="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POR QUÉ HUNTERPASS ── */}
      <section id="porqueHP" className="px-6 py-24 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <div>
            <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Por qué HunterPass</div>
            <h2 className="text-3xl md:text-4xl font-black">Por qué elegir HunterPass</h2>
            <p className="text-slate-400 mt-4 leading-relaxed">
              Combinamos tecnología, diseño y operación para ofrecer una experiencia de
              acceso más profesional, ordenada y medible.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "Imagen profesional",
                desc: "Una propuesta visual sólida que refuerza la percepción de orden, seguridad y nivel de servicio.",
              },
              {
                title: "Operación en tiempo real",
                desc: "Control de ingresos, activaciones y puntos de acceso con información actualizada durante el evento.",
              },
              {
                title: "Escalable",
                desc: "Funciona para boliches, corporativos, festivales, activaciones, viajes de egresados y eventos con múltiples accesos.",
              },
              {
                title: "Adaptable",
                desc: "La solución se ajusta según cantidad de asistentes, tipo de acceso, sectores y objetivos del evento.",
              },
              {
                title: "Hardware incluido",
                desc: "Proveemos lectores, pulseras NFC/RFID y dispositivos. Sin compras ni alquileres adicionales.",
              },
              {
                title: "Soporte en el evento",
                desc: "Equipo disponible el día del evento para resolver cualquier situación en el momento que se presente.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-[#0b1629] border border-white/8 rounded-xl p-4">
                <div className="w-4 h-0.5 bg-cyan-400 mb-3" />
                <h3 className="font-bold text-sm mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOCKUPS ── */}
      <section className="px-6 py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Mockups comerciales</div>
          <h2 className="text-3xl md:text-4xl font-black">Una experiencia visual clara desde el primer vistazo</h2>
          <p className="text-slate-400 mt-4 leading-relaxed">
            Credencial QR, pulsera NFC y panel de control integrados en una misma solución
            para gestionar accesos, activaciones y reportes.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          {[
            {
              label: "CREDENCIAL QR",
              content: (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg" />
                  <div className="w-14 h-2 bg-cyan-400/30 rounded" />
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg" />
                </div>
              ),
              footer: "Ingreso digital con validación rápida.",
            },
            {
              label: "PULSERA NFC",
              content: (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-20 h-8 bg-cyan-400/10 border border-cyan-400/30 rounded-full" />
                  <div className="w-3 h-3 bg-cyan-400/40 rounded-full mt-4" />
                </div>
              ),
              footer: "Asignación por UID y lectura por estación.",
            },
            {
              label: "DASHBOARD",
              content: (
                <div className="flex flex-col gap-2 py-3">
                  <div className="w-full h-2.5 bg-cyan-400/20 rounded" />
                  <div className="w-3/4 h-2.5 bg-white/10 rounded" />
                  <div className="w-full h-2.5 bg-white/10 rounded" />
                  <div className="w-2/3 h-2.5 bg-white/10 rounded" />
                </div>
              ),
              footer: "Métricas, accesos y reportes del evento.",
            },
          ].map(({ label, content, footer }) => (
            <div key={label} className="flex-1 bg-[#0b1629] border border-white/10 rounded-2xl p-4 flex flex-col">
              <div className="text-[10px] font-bold text-cyan-400 tracking-widest mb-3">{label}</div>
              <div className="flex-1">{content}</div>
              <p className="text-[11px] text-cyan-400/70 mt-3 leading-relaxed">{footer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAQUETES ── */}
      <section id="paquetes" className="px-6 py-24 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Paquetes</div>
            <h2 className="text-3xl md:text-4xl font-black">Planes pensados para distintos tipos de eventos</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              Elegí la opción que mejor se adapta a tu operación, desde accesos simples con QR
              hasta soluciones completas con NFC y reportes avanzados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Paquete QR",
                badge: "Entrada rápida",
                highlight: false,
                desc: "Para quien necesita resolver acreditación y acceso sin complicarse ni perder control.",
                features: ["Formulario de registro", "QR individual", "Check-in en puerta", "Base exportable"],
              },
              {
                name: "Paquete NFC",
                badge: "Experiencia premium",
                highlight: true,
                desc: "Para marcas y productores que quieren una operación más fuerte, más prolija y más memorable.",
                features: ["Asignación de UID", "Pulsera NFC/RFID", "Lecturas por estación", "Historial por asistente"],
              },
              {
                name: "Paquete Full",
                badge: "Control total",
                highlight: false,
                desc: "La opción completa para eventos donde el acceso, la trazabilidad y la imagen importan de verdad.",
                features: ["QR + NFC", "Dashboard operativo", "Múltiples puntos de lectura", "Reporte post-evento"],
              },
            ].map(({ name, badge, highlight, desc, features }) => (
              <div
                key={name}
                className={`rounded-2xl p-7 flex flex-col gap-5 border ${
                  highlight
                    ? "bg-[#0b1e35] border-cyan-400/50 shadow-lg shadow-cyan-400/10"
                    : "bg-white/[0.02] border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black">{name}</h3>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      highlight
                        ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                        : "bg-white/5 text-slate-400 border border-white/10"
                    }`}
                  >
                    {badge}
                  </span>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>

                <ul className="space-y-2 flex-1">
                  {features.map((f) => (
                    <li
                      key={f}
                      className={`text-sm px-4 py-2.5 rounded-lg border ${
                        highlight ? "border-cyan-400/20 bg-cyan-400/5 text-slate-200" : "border-white/8 bg-white/[0.03] text-slate-300"
                      }`}
                    >
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola HunterPass, me interesa el ${name}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                    highlight
                      ? "bg-cyan-400 text-black hover:bg-cyan-300"
                      : "bg-white/5 border border-white/15 text-white hover:bg-white/10"
                  }`}
                >
                  Quiero este paquete
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASOS DE USO ── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            {
              title: "Eventos corporativos",
              desc: "Invitados, sectores VIP y acreditaciones prolijas para una experiencia seria desde el ingreso.",
            },
            {
              title: "Festivales y boliches",
              desc: "Menos fila, más velocidad y control en distintos puntos del evento sin perder trazabilidad.",
            },
            {
              title: "Acciones de marca",
              desc: "Datos concretos para mostrar engagement real y no quedarse en el clásico 'salió bien' sin números.",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <div className="w-4 h-0.5 bg-cyan-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.015] border border-white/5 rounded-2xl px-8 py-10">
          <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Prueba social</div>
          <h2 className="text-3xl font-black mb-2">Encaja en eventos reales. No es una idea en el aire.</h2>
          <p className="text-slate-400 mb-8 max-w-xl">
            HunterPass se adapta a distintos formatos de eventos y experiencias donde el acceso,
            la trazabilidad y la organización son clave.
          </p>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                title: "Ideal para boliches y fiestas",
                desc: "Ingreso más rápido, menos fricción en puerta y mejor control de accesos en horas pico.",
              },
              {
                title: "Fuerte para eventos corporativos",
                desc: "Una experiencia prolija desde la acreditación hasta el reporte final, con imagen premium.",
              },
              {
                title: "Perfecto para activaciones",
                desc: "Seguimiento real por estaciones, stands o experiencias para mostrar datos concretos.",
              },
              {
                title: "Aplicable a viajes de egresados",
                desc: "Control de identificación, accesos y trazabilidad para grupos grandes con operación ordenada.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
                <div className="w-3 h-0.5 bg-cyan-400 mb-3" />
                <h3 className="font-bold text-sm mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-24 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14">
          <div>
            <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Preguntas frecuentes</div>
            <h2 className="text-3xl font-black mb-4">Preguntas frecuentes</h2>
            <p className="text-slate-400 leading-relaxed">
              Respondemos las consultas más comunes sobre implementación,
              operación y alcances del servicio.
            </p>
            <div className="mt-6 bg-white/[0.04] border border-white/8 rounded-xl p-5 text-sm text-slate-400">
              Trabajamos con soluciones adaptables para eventos, marcas y experiencias
              que necesitan una operación más ordenada y profesional.
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "¿HunterPass trabaja con QR y también con pulseras NFC/RFID?",
                a: "Sí. La propuesta puede resolverse con QR, con pulseras NFC/RFID o con una combinación de ambos según el tipo de evento.",
              },
              {
                q: "¿Solo ofrecen el sistema o también el soporte físico?",
                a: "Se puede ofrecer la solución completa: acreditación, control de acceso, pulseras o credenciales y la lógica operativa del evento.",
              },
              {
                q: "¿Sirve para eventos chicos o solo para producciones grandes?",
                a: "Sirve para ambos. Se adapta a eventos reducidos, acciones de marca, fiestas, corporativos y operaciones con múltiples accesos.",
              },
              {
                q: "¿Se puede controlar el paso por diferentes estaciones?",
                a: "Sí. Uno de los puntos fuertes es registrar ingresos, reingresos y paso por activaciones o sectores específicos.",
              },
              {
                q: "¿Entregan información y reportes después del evento?",
                a: "Sí. La idea es que el cliente no se quede solo con el acceso resuelto, sino también con datos exportables y trazabilidad útil.",
              },
              {
                q: "¿Se puede personalizar según la necesidad del cliente?",
                a: "Totalmente. La propuesta se ajusta según cantidad de asistentes, tipo de acceso, puntos de control y objetivo comercial del evento.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white/[0.025] border border-white/8 rounded-xl p-5">
                <h3 className="font-bold text-sm">{q}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="px-6 py-24">
        <div className="max-w-5xl mx-auto bg-white/[0.025] border border-white/10 rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Contacto</div>
            <h2 className="text-3xl font-black mb-4">Solicitá una propuesta para tu evento</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Completá el formulario y enviá tu consulta por WhatsApp
              con los datos principales de tu evento.
            </p>

            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/40 text-cyan-400 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-cyan-400/20 transition-colors"
            >
              WhatsApp comercial: +54 9 11 6624-2165
            </a>

            <div className="mt-6 bg-white/[0.04] border border-white/8 rounded-xl p-5 text-sm text-slate-400 leading-relaxed">
              Nuestro equipo evalúa tu necesidad y te acerca una
              propuesta ajustada al tipo de acceso, cantidad de asistentes y
              nivel de control requerido.
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                name="nombre"
                placeholder="Nombre"
                onChange={handleChange}
                className="p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
              />
              <input
                name="empresa"
                placeholder="Empresa / Marca"
                onChange={handleChange}
                className="p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <input
              name="contacto"
              placeholder="Email o WhatsApp"
              onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="tipoEvento"
                placeholder="Tipo de evento"
                onChange={handleChange}
                className="p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
              />
              <input
                name="asistentes"
                placeholder="Cantidad estimada"
                onChange={handleChange}
                className="p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <textarea
              name="mensaje"
              placeholder="Contanos tu evento"
              rows={4}
              onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400/50 resize-none"
            />

            <a
              href={mensajeWhatsapp}
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-cyan-400 hover:bg-cyan-300 transition-colors text-black font-bold py-4 rounded-xl text-base"
            >
              Enviar por WhatsApp
            </a>

            <p className="text-xs text-slate-500 text-center">
              El mensaje se envía con la información cargada para agilizar la evaluación de tu evento.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-hunterpass.png" alt="HunterPass" className="h-8 w-auto opacity-70" />
            <span className="text-sm text-slate-500">Control de accesos para eventos &copy; {new Date().getFullYear()}</span>
          </div>
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-cyan-400/60 hover:text-cyan-400 transition-colors"
          >
            +54 9 11 6624-2165
          </a>
        </div>
      </footer>

      {/* ── WHATSAPP FLOTANTE ── */}
      <a
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-400 transition-colors text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-2"
      >
        <span className="text-lg">WA</span>
        WhatsApp directo · +54 9 11 6624-2165
      </a>
    </div>
  );
}
