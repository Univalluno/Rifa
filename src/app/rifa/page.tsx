"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Ticket = {
  numero: number;
  cedula: string;
};

function RifaContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cedula = searchParams.get("cedula") || "";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [misNumeros, setMisNumeros] = useState<number[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cedula) {
      router.push("/login");
      return;
    }
    cargar();
  }, [cedula, router]);

  async function cargar() {
    const { data, error } = await supabase
      .from("tickets")
      .select("numero, cedula");

    setCargando(false);

    if (error) {
      setError("Error al cargar números.");
      return;
    }

    const lista = (data as Ticket[]) || [];

    setTickets(lista);

    setMisNumeros(
      lista
        .filter((t) => t.cedula === cedula)
        .map((t) => t.numero)
    );
  }

  function seleccionar(n: number) {
    if (misNumeros.includes(n) || confirmando) return;

    setSeleccionado(n);
    setError("");
  }

  async function confirmar() {
    if (seleccionado === null) return;

    setConfirmando(true);
    setError("");

    const { error: dbError } = await supabase
      .from("tickets")
      .insert({ numero: seleccionado, cedula });

    setConfirmando(false);

    if (dbError) {
      setError("Ese número ya fue tomado. Elige otro.");
      setSeleccionado(null);
      await cargar();
      return;
    }

    const numeroConfirmado = seleccionado;

    setSeleccionado(null);

    await cargar();

    toast.success(
      `¡Número ${String(numeroConfirmado).padStart(2, "0")} guardado con éxito!`,
      {
        description: "Tu reserva quedó registrada. Gracias por participar.",
        duration: 5000,
      }
    );
  }

  function estaOcupado(n: number) {
    return tickets.some((t) => t.numero === n);
  }

  if (cargando) {
    return (
      <main className="rifa-page loading-page">
        <div className="loading-box">
          <div className="loading-spinner" />
          <p>CARGANDO RIFA...</p>
        </div>
      </main>
    );
  }

  const disponibles = 100 - tickets.length;

  return (
    <main className="rifa-page">

      {/* DECORACIONES */}
      <div className="background-effects">
        <div className="light-orb orb-one" />
        <div className="light-orb orb-two" />
        <div className="light-orb orb-three" />

        <StickerTrebol className="decoration trebol" />
        <StickerMonedas className="decoration monedas" />
        <StickerBolsa className="decoration bolsa" />
        <StickerBillete className="decoration billete" />

        <StickerEstrella className="decoration estrella estrella-one" />
        <StickerEstrella className="decoration estrella estrella-two" />
        <StickerEstrella className="decoration estrella estrella-three" />
        <StickerEstrella className="decoration estrella estrella-four" />

        <Sparkle className="decoration sparkle sparkle-one" />
        <Sparkle className="decoration sparkle sparkle-two" />
        <Sparkle className="decoration sparkle sparkle-three" />
      </div>

      <div className="rifa-wrapper">

        {/* BOTÓN VOLVER — arriba a la izquierda */}
        <div className="back-container">
          <Link href="/" className="back-button">
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            VOLVER AL INICIO
          </Link>
        </div>

        {/* TARJETA */}
        <div className="rifa-card">

          <header className="rifa-header">
            <div className="header-shine" />

            <div className="live-badge">
              <span className="live-dot" />
              EN VIVO
            </div>

            <div className="header-content">
              <p className="small-title">
                ★ ★ ★ GRAN RIFA ★ ★ ★
              </p>

              <h1>RIFA SOLIDARIA</h1>

              <div className="prize">
                <span>PREMIO</span>
                <strong>$500.000</strong>
              </div>
            </div>

            <div className="header-star star-left">✦</div>
            <div className="header-star star-right">✦</div>
          </header>

          <div className="rifa-content">

            <div className="stats">
              <div className="stat">
                <span className="stat-dot available" />
                <span>{disponibles} libres</span>
              </div>

              <div className="stat-line" />

              <div className="stat">
                <span className="stat-dot taken" />
                <span>{tickets.length} tomados</span>
              </div>
            </div>

            {error && (
              <div className="error-message">⚠ {error}</div>
            )}

            <div className="main-layout">

              {/* MIS NÚMEROS */}
              <aside className="my-numbers">
                <div className="panel-glow" />

                <div className="my-header">
                  <p>★ MIS NÚMEROS ★</p>
                  <span>Números reservados</span>
                </div>

                {misNumeros.length > 0 ? (
                  <div className="my-number-grid">
                    {misNumeros
                      .slice()
                      .sort((a, b) => a - b)
                      .map((n) => (
                        <div key={n} className="my-number">
                          <span>
                            {String(n).padStart(2, "0")}
                          </span>
                          <div className="check">✓</div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="empty-numbers">
                    <div className="ticket-icon">🎟️</div>
                    <p>Todavía no tienes números</p>
                    <span>Elige uno del tablero</span>
                  </div>
                )}

                {misNumeros.length > 0 && (
                  <div className="numbers-total">
                    {misNumeros.length}{" "}
                    {misNumeros.length === 1
                      ? "número reservado"
                      : "números reservados"}
                  </div>
                )}
              </aside>

              {/* TABLERO */}
              <section className="numbers-section">

                <div className="numbers-header">
                  <div>
                    <h2>ELIGE TU NÚMERO</h2>
                    <p>Selecciona uno de los números disponibles</p>
                  </div>

                  <div className="available-counter">
                    <strong>{disponibles}</strong>
                    <span>disponibles</span>
                  </div>
                </div>

                <div className="legend">
                  <div>
                    <i className="legend-free" />
                    Disponible
                  </div>
                  <div>
                    <i className="legend-mine" />
                    Mi número
                  </div>
                  <div>
                    <i className="legend-taken" />
                    Ocupado
                  </div>
                </div>

                <div className="numbers-grid">
                  {Array.from({ length: 100 }, (_, i) => i).map((n) => {
                    const ocupado = estaOcupado(n);
                    const esMio = misNumeros.includes(n);
                    const esSeleccion = seleccionado === n;
                    const numero = String(n).padStart(2, "0");

                    if (esMio) {
                      return (
                        <div
                          key={n}
                          className="number number-mine"
                        >
                          {numero}
                          <span className="mini-check">✓</span>
                        </div>
                      );
                    }

                    if (esSeleccion) {
                      return (
                        <button
                          key={n}
                          onClick={() => setSeleccionado(null)}
                          className="number number-selected"
                        >
                          {numero}
                        </button>
                      );
                    }

                    if (ocupado) {
                      return (
                        <div
                          key={n}
                          className="number number-taken"
                        >
                          {numero}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={n}
                        onClick={() => seleccionar(n)}
                        className="number number-free"
                      >
                        {numero}
                      </button>
                    );
                  })}
                </div>

              </section>

            </div>
          </div>

          <footer className="rifa-footer">
            <span>✦</span>
            <p>CHONTICO NOCHE · 9 OCTUBRE 2026</p>
            <span>✦</span>
          </footer>

        </div>

      </div>

      {/* BARRA CONFIRMACIÓN */}
      {seleccionado !== null && (
        <div className="confirmation-bar">
          <div className="confirmation-content">

            <div className="selected-number">
              <span>NÚMERO SELECCIONADO</span>
              <strong>
                {String(seleccionado).padStart(2, "0")}
              </strong>
            </div>

            <div className="confirmation-buttons">
              <button
                onClick={() => setSeleccionado(null)}
                disabled={confirmando}
                className="other-button"
              >
                OTRO
              </button>

              <button
                onClick={confirmar}
                disabled={confirmando}
                className="confirm-button"
              >
                {confirmando
                  ? "GUARDANDO..."
                  : "CONFIRMAR NÚMERO"}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}

/* =========================================================
   SVG DECORATIVOS
   ========================================================= */

function StickerTrebol({ className = "" }: { className?: string }) {
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

function StickerMonedas({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className}>
      <ellipse cx="40" cy="60" rx="26" ry="6" fill="#C9A227" />
      <ellipse cx="40" cy="52" rx="26" ry="6" fill="#E8B923" stroke="#C9A227" strokeWidth="1.5" />
      <ellipse cx="40" cy="44" rx="26" ry="6" fill="#F5D142" stroke="#C9A227" strokeWidth="1.5" />
      <ellipse cx="40" cy="36" rx="26" ry="6" fill="#E8B923" stroke="#C9A227" strokeWidth="1.5" />
      <ellipse cx="40" cy="28" rx="26" ry="6" fill="#F5D142" stroke="#C9A227" strokeWidth="1.5" />
      <text x="40" y="31" textAnchor="middle" fill="#0F5132" fontSize="8" fontWeight="bold">
        $
      </text>
    </svg>
  );
}

function StickerBolsa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className}>
      <path d="M20 30 Q15 25 20 20 Q25 15 32 20" stroke="#8B6F1E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 30 Q65 25 60 20 Q55 15 48 20" stroke="#8B6F1E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M18 30 L62 30 L58 68 Q57 72 53 72 L27 72 Q23 72 22 68 Z" fill="#C9A227" stroke="#8B6F1E" strokeWidth="2" />
      <text x="40" y="55" textAnchor="middle" fill="#F5D142" fontSize="20" fontWeight="bold">
        $
      </text>
    </svg>
  );
}

function StickerBillete({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className}>
      <rect x="2" y="6" width="96" height="48" rx="4" fill="#22C55E" stroke="#0F5132" strokeWidth="2" />
      <rect x="10" y="14" width="80" height="32" rx="2" fill="none" stroke="#F5D142" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="50" cy="30" r="10" fill="#F5D142" stroke="#0F5132" strokeWidth="1.5" />
      <text x="50" y="35" textAnchor="middle" fill="#0F5132" fontSize="14" fontWeight="bold">
        $
      </text>
    </svg>
  );
}

function StickerEstrella({ className = "" }: { className?: string }) {
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

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M12 1 L14 9 L23 12 L14 15 L12 23 L10 15 L1 12 L10 9 Z"
        fill="#F5D142"
      />
    </svg>
  );
}

export default function RifaPage() {
  return (
    <Suspense fallback={null}>
      <RifaContenido />
    </Suspense>
  );
}