"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FormData = {
  cedula: string;
  nombre: string;
  telefono: string;
  direccion: string;
  correo: string;
};

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormData>({
    cedula: "",
    nombre: "",
    telefono: "",
    direccion: "",
    correo: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Autocompletar cédula desde la URL
  useEffect(() => {
    const cedulaUrl = searchParams.get("cedula");
    if (cedulaUrl) {
      setForm((prev) => ({ ...prev, cedula: cedulaUrl }));
    }
  }, [searchParams]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !form.cedula.trim() ||
      !form.nombre.trim() ||
      !form.telefono.trim() ||
      !form.direccion.trim()
    ) {
      setError("Completa los campos obligatorios.");
      return;
    }

    setCargando(true);

    const { error: dbError } = await supabase.from("participants").insert({
      cedula: form.cedula.trim(),
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      correo: form.correo.trim() || null,
    });

    setCargando(false);

    if (dbError) {
      setError("No se pudo registrar. Intenta de nuevo.");
      console.error(dbError);
      return;
    }

    router.push(`/rifa?cedula=${encodeURIComponent(form.cedula)}`);
  }

  return (
    <main className="home-hero">

      {/* DECORACIONES FLOTANTES */}
      <div className="hero-decorations">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-orb hero-orb-4" />

        <TrebolSvg className="hero-deco hero-deco-trebol" />
        <MonedasSvg className="hero-deco hero-deco-monedas" />
        <BolsaSvg className="hero-deco hero-deco-bolsa" />
        <BilleteSvg className="hero-deco hero-deco-billete" />

        <EstrellaSvg className="hero-sparkle hero-sparkle-1" />
        <EstrellaSvg className="hero-sparkle hero-sparkle-2" />
        <EstrellaSvg className="hero-sparkle hero-sparkle-3" />
        <EstrellaSvg className="hero-sparkle hero-sparkle-4" />
        <EstrellaSvg className="hero-sparkle hero-sparkle-5" />
        <EstrellaSvg className="hero-sparkle hero-sparkle-6" />
      </div>

      {/* CONTENIDO */}
      <div className="hero-container">

        <div className="hero-card">

          {/* CABECERA */}
          <div className="hero-header">

            <Link href="/" className="hero-back-link">
              ← Volver
            </Link>

            <span className="hero-badge" style={{ marginTop: 12 }}>
              ✦ COMPLETA TUS DATOS ✦
            </span>

            <h1 className="hero-title">
              <span className="hero-title-price">
                Registro
              </span>
            </h1>

            <p className="hero-subtitle">
              Completa tus datos para participar en la rifa
            </p>

            <div className="hero-divider">
              <span>✦</span>
            </div>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="hero-form">

            {error && (
              <div className="hero-error">
                ⚠ {error}
              </div>
            )}

            <div className="hero-field">
              <label htmlFor="cedula" className="hero-label">
                Cédula *
              </label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                inputMode="numeric"
                value={form.cedula}
                onChange={handleChange}
                className="hero-input"
                placeholder="1234567890"
                autoComplete="off"
              />
            </div>

            <div className="hero-field">
              <label htmlFor="nombre" className="hero-label">
                Nombre completo *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                className="hero-input"
                placeholder="Juan Pérez"
                autoComplete="off"
              />
            </div>

            <div className="hero-field">
              <label htmlFor="telefono" className="hero-label">
                Teléfono / WhatsApp *
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                inputMode="tel"
                value={form.telefono}
                onChange={handleChange}
                className="hero-input"
                placeholder="300 123 4567"
                autoComplete="off"
              />
            </div>

            <div className="hero-field">
              <label htmlFor="direccion" className="hero-label">
                Dirección de residencia *
              </label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                value={form.direccion}
                onChange={handleChange}
                className="hero-input"
                placeholder="Calle 1 # 2-34, Barrio"
                autoComplete="off"
              />
            </div>

            <div className="hero-field">
              <label htmlFor="correo" className="hero-label">
                Correo (opcional)
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                className="hero-input"
                placeholder="correo@ejemplo.com"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="hero-submit"
            >
              <span>
                {cargando ? "GUARDANDO..." : "CONTINUAR"}
              </span>
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </form>

          {/* FOOTER */}
          <div className="hero-footer">
            <span className="hero-footer-star">✦</span>
            <div className="hero-footer-date">
              <p className="hero-footer-lottery">
                CHONTICO NOCHE
              </p>
              <p className="hero-footer-day">
                9 DE OCTUBRE DE 2026
              </p>
            </div>
            <span className="hero-footer-star">✦</span>
          </div>

        </div>

      </div>
    </main>
  );
}

/* =========================================================
   SVG DECORATIVOS
   ========================================================= */

function TrebolSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <g fill="#22C55E" stroke="#0F5132" strokeWidth="1.5">
        <circle cx="32" cy="20" r="10" />
        <circle cx="20" cy="32" r="10" />
        <circle cx="44" cy="32" r="10" />
      </g>
      <path
        d="M32 40 Q30 50 32 58"
        stroke="#0F5132"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MonedasSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className}>
      <ellipse cx="40" cy="60" rx="26" ry="6" fill="#C9A227" />
      <ellipse cx="40" cy="52" rx="26" ry="6" fill="#E8B923" stroke="#C9A227" strokeWidth="1.5" />
      <ellipse cx="40" cy="44" rx="26" ry="6" fill="#F5D142" stroke="#C9A227" strokeWidth="1.5" />
      <ellipse cx="40" cy="36" rx="26" ry="6" fill="#E8B923" stroke="#C9A227" strokeWidth="1.5" />
      <ellipse cx="40" cy="28" rx="26" ry="6" fill="#F5D142" stroke="#C9A227" strokeWidth="1.5" />
      <text x="40" y="31" textAnchor="middle" fill="#0F5132" fontSize="8" fontWeight="bold">$</text>
    </svg>
  );
}

function BolsaSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className}>
      <path d="M20 30 Q15 25 20 20 Q25 15 32 20" stroke="#8B6F1E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 30 Q65 25 60 20 Q55 15 48 20" stroke="#8B6F1E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M18 30 L62 30 L58 68 Q57 72 53 72 L27 72 Q23 72 22 68 Z" fill="#C9A227" stroke="#8B6F1E" strokeWidth="2" />
      <text x="40" y="55" textAnchor="middle" fill="#F5D142" fontSize="20" fontWeight="bold">$</text>
    </svg>
  );
}

function BilleteSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className}>
      <rect x="2" y="6" width="96" height="48" rx="4" fill="#22C55E" stroke="#0F5132" strokeWidth="2" />
      <rect x="10" y="14" width="80" height="32" rx="2" fill="none" stroke="#F5D142" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="50" cy="30" r="10" fill="#F5D142" stroke="#0F5132" strokeWidth="1.5" />
      <text x="50" y="35" textAnchor="middle" fill="#0F5132" fontSize="14" fontWeight="bold">$</text>
    </svg>
  );
}

function EstrellaSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2 L14 9 L21 11 L14 13 L12 20 L10 13 L3 11 L10 9 Z"
        fill="#F5D142"
        stroke="#C9A227"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={null}>
      <RegistroForm />
    </Suspense>
  );
}