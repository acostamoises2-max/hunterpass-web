import { useMemo, useState } from "react";

export default function App() {
  const whatsappNumber = "5491166242165";

  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    contacto: "",
    tipoEvento: "",
    asistentes: "",
    mensaje: "",
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
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lineas.join("\n"))}`;
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const logoSrc = "/logo-hunterpass.png";

  return (
    <div className="bg-[#030712] text-white min-h-screen font-sans">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Fondo con degradado y glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#030712] to-[#000d1a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-cyan-400/5 rounded-full blur-3xl" />

        <div className="relative px-6 py-24 max-w-6xl mx-auto text-center">
          <img
            src={logoSrc}
            alt="HunterPass"
            className="w-56 md:w-72 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          />

          <div className="inline-block bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Control de accesos para eventos
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl mx-auto">
            Gestión de ingresos con{" "}
            <span className="text-cyan-400">QR y NFC</span>{" "}
            para eventos que no pueden fallar
          </h1>

          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            Pulseras NFC, tickets QR, dashboard en tiempo real y reportes
            post-evento. Todo desde una sola plataforma pensada para la Argentina.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a
              href="#contacto"
              className="px-8 py-4 bg-cyan-400 text-black font-bold rounded-xl text-lg hover:bg-cyan-300 transition-colors"
            >
              Pedir propuesta gratis
            </a>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 border border-cyan-400/40 text-cyan-400 font-bold rounded-xl text-lg hover:bg-cyan-400/10 transition-colors"
            >
              Hablar por WhatsApp
            </a>
          </div>

          {/* Stats rápidos */}
          <div className="flex flex-wrap justify-center gap-10 mt-16 text-center">
            {[
              ["500+", "eventos gestionados"],
              ["200k+", "accesos validados"],
              ["99.9%", "uptime en vivo"],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="text-3xl font-black text-cyan-400">{num}</div>
                <div className="text-sm text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LO QUE OFRECEMOS ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black">
            Todo lo que necesitás para tu evento
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Soluciones modulares que se adaptan al tipo y tamaño de cada evento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: "◈",
              title: "Pulseras NFC",
              desc: "Pulseras con chip NFC para accesos sin contacto, zonas VIP, consumiciones y activaciones de marca. Reutilizables o descartables según tu evento.",
              tags: ["Sin contacto", "Zonas VIP", "Consumiciones"],
            },
            {
              icon: "▣",
              title: "Tickets QR",
              desc: "Generación y validación de tickets con código QR. Importá tu base de datos o vendé a través de nuestra plataforma. Validación instantánea.",
              tags: ["Importación CSV", "Validación rápida", "Anti-fraude"],
            },
            {
              icon: "◉",
              title: "Dashboard en tiempo real",
              desc: "Seguí el aforo, ingresos por minuto y zonas activas desde cualquier dispositivo. Tomá decisiones con datos concretos durante el evento.",
              tags: ["Aforo en vivo", "Múltiples lectores", "Mobile y PC"],
            },
            {
              icon: "◎",
              title: "Reportes post-evento",
              desc: "Exportá reportes detallados de ingresos, horarios pico, performance por puerta y métricas de asistencia para justificar inversiones.",
              tags: ["Exportar PDF/Excel", "Métricas de aforo", "Análisis horario"],
            },
          ].map(({ icon, title, desc, tags }) => (
            <div
              key={title}
              className="bg-white/[0.03] border border-cyan-400/20 p-7 rounded-2xl hover:border-cyan-400/40 transition-colors group"
            >
              <div className="text-cyan-400 text-3xl mb-4">{icon}</div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-cyan-400/10 text-cyan-400 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="px-6 py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black">Cómo funciona</h2>
            <p className="text-slate-400 mt-3">
              Del contrato al evento en menos tiempo del que pensás.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Nos contás tu evento",
                desc: "Fecha, tipo, cantidad de asistentes y zonas. Te armamos una propuesta en 24 hs.",
              },
              {
                step: "02",
                title: "Configuramos la plataforma",
                desc: "Cargamos el listado, configuramos los lectores y probamos todo antes del evento.",
              },
              {
                step: "03",
                title: "El día del evento",
                desc: "Tu equipo valida accesos desde el app. Vos ves el dashboard en tiempo real.",
              },
              {
                step: "04",
                title: "Post-evento",
                desc: "Recibís el reporte completo con todas las métricas para tu próxima edición.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-black text-cyan-400/10 absolute -top-2 -left-1 select-none">
                  {step}
                </div>
                <div className="pt-8 pl-2">
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASOS DE USO ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black">
            Funciona en cualquier tipo de evento
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Boliches y fiestas",
              desc: "Control de aforo, zonas VIP, consumiciones con NFC y lista de invitados. Sin filas eternas en la puerta.",
              detail: "Hasta 5.000 asistentes · Múltiples puertas · Lista VIP",
            },
            {
              title: "Eventos corporativos",
              desc: "Check-in rápido, credenciales inteligentes y registro de asistencia por sesión para congresos y conferencias.",
              detail: "Credenciales NFC · Asistencia por sala · Reporte ejecutivo",
            },
            {
              title: "Activaciones de marca",
              desc: "Experiencias interactivas con pulseras NFC que activan stands, cargan créditos o registran participación en dinámicas.",
              detail: "Gamificación · Créditos digitales · Métricas de marca",
            },
            {
              title: "Viajes de egresados",
              desc: "Control de ingresos a excursiones, habitaciones y actividades. Trazabilidad completa durante todo el viaje.",
              detail: "Trazabilidad 24/7 · Control por actividad · App offline",
            },
          ].map(({ title, desc, detail }) => (
            <div
              key={title}
              className="border border-cyan-400/20 bg-white/[0.02] p-6 rounded-2xl hover:bg-white/[0.04] transition-colors"
            >
              <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>
              <div className="text-xs text-cyan-400/70 border-t border-cyan-400/10 pt-3">
                {detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POR QUÉ HUNTERPASS ── */}
      <section className="px-6 py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black">
              Por qué elegir HunterPass
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Funciona sin internet",
                desc: "El app de validación opera en modo offline. Si se corta la conexión, el evento no se detiene.",
              },
              {
                title: "Soporte el día del evento",
                desc: "Tenés un equipo de soporte disponible durante todo el evento para resolver cualquier inconveniente en el momento.",
              },
              {
                title: "Integración con tu ticketera",
                desc: "Importamos listas desde cualquier plataforma de venta: Passline, TuEntrada, Eventbrite, Excel propio o sistema custom.",
              },
              {
                title: "Hardware incluido",
                desc: "Proveemos los lectores NFC/QR, pulseras y dispositivos necesarios. No tenés que comprar ni alquilar nada aparte.",
              },
              {
                title: "Configuración en horas",
                desc: "No hace falta un equipo técnico. Configuramos todo nosotros y capacitamos a tu personal en menos de 30 minutos.",
              },
              {
                title: "Precio por evento",
                desc: "Sin suscripciones mensuales. Pagás por evento según la escala. Ideal para productoras con distintos volúmenes.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="border border-cyan-400/20 p-6 rounded-2xl"
              >
                <div className="w-2 h-2 bg-cyan-400 rounded-full mb-4" />
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
          Preguntas frecuentes
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "¿Funciona con QR y NFC al mismo tiempo?",
              a: "Sí. Podés usar ambas tecnologías en el mismo evento. Por ejemplo QR en la entrada general y NFC en zonas VIP o para consumiciones.",
            },
            {
              q: "¿Las pulseras NFC están incluidas?",
              a: "Sí, ofrecemos la solución completa: hardware, pulseras, app de validación y plataforma. Todo en un solo proveedor.",
            },
            {
              q: "¿Cuántas personas puede manejar?",
              a: "Desde 100 asistentes hasta decenas de miles. La plataforma escala sin límite y soporta múltiples puertas y lectores simultáneos.",
            },
            {
              q: "¿Qué pasa si no hay internet en el venue?",
              a: "El app funciona en modo offline y sincroniza cuando recupera conexión. Los accesos no se detienen por problemas de red.",
            },
            {
              q: "¿Puedo ver las estadísticas desde mi celular?",
              a: "Sí. El dashboard es responsive y podés seguir el aforo y los ingresos en tiempo real desde cualquier dispositivo.",
            },
            {
              q: "¿Con cuánta anticipación hay que contratar?",
              a: "Idealmente una semana antes, pero trabajamos con tiempos cortos. Contactanos y te decimos si podemos cubrir tu fecha.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="border border-cyan-400/20 bg-white/[0.02] p-6 rounded-2xl"
            >
              <h3 className="font-bold text-base">{item.q}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section
        id="contacto"
        className="px-6 py-20 bg-gradient-to-b from-transparent to-[#000d1a]"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black">
              Pedí tu propuesta gratis
            </h2>
            <p className="text-slate-400 mt-3">
              Contanos tu evento y te respondemos en menos de 24 hs.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-cyan-400/20 p-8 rounded-2xl">
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="nombre"
                  placeholder="Tu nombre"
                  onChange={handleChange}
                  className="p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
                <input
                  name="empresa"
                  placeholder="Empresa o productora"
                  onChange={handleChange}
                  className="p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <input
                name="contacto"
                placeholder="WhatsApp o email"
                onChange={handleChange}
                className="p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
              />
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="tipoEvento"
                  placeholder="Tipo de evento"
                  onChange={handleChange}
                  className="p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
                <input
                  name="asistentes"
                  placeholder="Cantidad estimada de asistentes"
                  onChange={handleChange}
                  className="p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <textarea
                name="mensaje"
                placeholder="Contanos más sobre tu evento (fecha, lugar, necesidades especiales...)"
                rows={4}
                onChange={handleChange}
                className="p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 resize-none"
              />

              <a
                href={mensajeWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-center bg-cyan-400 hover:bg-cyan-300 transition-colors text-black font-bold py-4 rounded-xl text-lg"
              >
                Enviar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-sm text-slate-500">
        <img src={logoSrc} alt="HunterPass" className="w-24 mx-auto mb-4 opacity-60" />
        <p>HunterPass &copy; {new Date().getFullYear()} — Control de accesos para eventos</p>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-cyan-400/60 hover:text-cyan-400 transition-colors"
        >
          Contacto por WhatsApp
        </a>
      </footer>
    </div>
  );
}
