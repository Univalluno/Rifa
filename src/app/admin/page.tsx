"use client";

import {
  useEffect,
  useState,
  Suspense,
  Fragment,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const PRECIO_BOLETA = 15000;

type Ticket = {
  id: string;
  numero: number;
  cedula: string;
  pagado: boolean;
  created_at: string;
  pagado_en: string | null;
};

type Participante = {
  cedula: string;
  nombre: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  is_admin: boolean | null;
};

function AdminContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cedulaAdmin = searchParams.get("cedula") || "";

  const [nombreAdmin, setNombreAdmin] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [participantes, setParticipantes] = useState<
    Record<string, Participante>
  >({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [detalleAbierto, setDetalleAbierto] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  // GANADOR
  const [numeroGanador, setNumeroGanador] = useState<number | null>(null);
  const [inputGanador, setInputGanador] = useState("");
  const [publicandoGanador, setPublicandoGanador] = useState(false);

  useEffect(() => {
    if (!cedulaAdmin) {
      router.push("/login");
      return;
    }
    verificarYCargar();
  }, [cedulaAdmin, router]);

  // REALTIME
  useEffect(() => {
    if (!cedulaAdmin) return;

    const canal = supabase
      .channel("admin-cambios")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => {
          cargarTickets();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rifa_state" },
        (payload) => {
          const nuevo = payload.new as { numero_ganador: number | null };
          if (nuevo && "numero_ganador" in nuevo) {
            setNumeroGanador(nuevo.numero_ganador);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [cedulaAdmin]);

  async function verificarYCargar() {
    const { data: adminData, error: adminError } = await supabase
      .from("participants")
      .select("is_admin, nombre")
      .eq("cedula", cedulaAdmin)
      .maybeSingle();

    if (adminError || !adminData?.is_admin) {
      router.push("/login");
      return;
    }

    setNombreAdmin(adminData.nombre || "");

    const [ticketsRes, participantesRes, estadoRes] = await Promise.all([
      supabase
        .from("tickets")
        .select("id, numero, cedula, pagado, created_at, pagado_en")
        .order("numero", { ascending: true }),
      supabase
        .from("participants")
        .select("cedula, nombre, telefono, correo, direccion, is_admin"),
      supabase
        .from("rifa_state")
        .select("numero_ganador")
        .eq("id", 1)
        .maybeSingle(),
    ]);

    setCargando(false);

    if (ticketsRes.error || participantesRes.error) {
      setError("Error al cargar datos. Intenta de nuevo.");
      return;
    }

    setTickets((ticketsRes.data as Ticket[]) || []);

    const mapa: Record<string, Participante> = {};
    ((participantesRes.data as Participante[]) || []).forEach((p) => {
      mapa[p.cedula] = p;
    });
    setParticipantes(mapa);

    if (estadoRes.data) {
      setNumeroGanador(
        (estadoRes.data as { numero_ganador: number | null })
          .numero_ganador
      );
    }
  }

  async function cargarTickets() {
    const { data } = await supabase
      .from("tickets")
      .select("id, numero, cedula, pagado, created_at, pagado_en")
      .order("numero", { ascending: true });

    if (data) setTickets(data as Ticket[]);
  }

  async function marcarPagado(ticket: Ticket) {
    if (ticket.pagado) return;

    setProcesando(ticket.id);

    const { error: dbError } = await supabase
      .from("tickets")
      .update({
        pagado: true,
        pagado_en: new Date().toISOString(),
      })
      .eq("id", ticket.id);

    setProcesando(null);

    if (dbError) {
      toast.error("Error al marcar como pagado");
      return;
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? { ...t, pagado: true, pagado_en: new Date().toISOString() }
          : t
      )
    );

    toast.success(
      `Número ${String(ticket.numero).padStart(2, "0")} marcado como pagado`
    );
  }

  async function liberarNumero(ticket: Ticket) {
    if (ticket.pagado) {
      toast.error("No puedes liberar un número ya pagado");
      return;
    }

    const ok = window.confirm(
      `¿Liberar el número ${String(ticket.numero).padStart(
        2,
        "0"
      )}? Se eliminará la reserva y quedará disponible de nuevo.`
    );

    if (!ok) return;

    setProcesando(ticket.id);

    const { error: dbError } = await supabase
      .from("tickets")
      .delete()
      .eq("id", ticket.id);

    setProcesando(null);

    if (dbError) {
      toast.error("Error al liberar el número");
      return;
    }

    setTickets((prev) => prev.filter((t) => t.id !== ticket.id));

    toast.success(
      `Número ${String(ticket.numero).padStart(2, "0")} liberado`
    );
  }

  // PUBLICAR GANADOR
  async function publicarGanador() {
  const num = parseInt(inputGanador.trim(), 10);

  if (isNaN(num) || num < 0 || num > 99) {
    toast.error("Ingresa un número entre 00 y 99");
    return;
  }

    setPublicandoGanador(true);

    const { error: dbError } = await supabase
      .from("rifa_state")
      .update({
        numero_ganador: num,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", 1);

    setPublicandoGanador(false);

    if (dbError) {
      toast.error("Error al publicar el número ganador");
      return;
    }

    setNumeroGanador(num);
    toast.success(
      `🎉 Número ganador publicado: ${String(num).padStart(2, "0")}`
    );
  }

  async function borrarGanador() {
    const ok = window.confirm(
      "¿Borrar el número ganador? Los usuarios dejarán de verlo."
    );
    if (!ok) return;

    setPublicandoGanador(true);

    const { error: dbError } = await supabase
      .from("rifa_state")
      .update({
        numero_ganador: null,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", 1);

    setPublicandoGanador(false);

    if (dbError) {
      toast.error("Error al borrar el número ganador");
      return;
    }

    setNumeroGanador(null);
    setInputGanador("");
    toast.success("Número ganador borrado");
  }

  // CONTABILIDAD
  const pagados = tickets.filter((t) => t.pagado);
  const pendientes = tickets.filter((t) => !t.pagado);

  const totalPagado = pagados.length * PRECIO_BOLETA;
  const totalPendiente = pendientes.length * PRECIO_BOLETA;
  const totalGeneral = totalPagado + totalPendiente;

  // FILTRO
  const filtro = busqueda.trim().toLowerCase();
  const ticketsFiltrados = filtro
    ? tickets.filter((t) => {
        const num = String(t.numero).padStart(2, "0");
        const p = participantes[t.cedula];
        const nombre = p?.nombre?.toLowerCase() || "";
        return (
          num.includes(filtro) ||
          t.cedula.toLowerCase().includes(filtro) ||
          nombre.includes(filtro)
        );
      })
    : tickets;

  function formatPrecio(n: number) {
    return "$" + n.toLocaleString("es-CO");
  }

  function formatFecha(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getNumerosDe(cedula: string) {
    return tickets.filter((t) => t.cedula === cedula);
  }

  if (cargando) {
    return (
      <main className="light-page">
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              color: "#0f5132",
              letterSpacing: "0.35em",
              fontSize: 12,
            }}
          >
            CARGANDO PANEL...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="light-page">
      <div className="admin-container">
        <div className="admin-wrapper">

          {/* HEADER */}
          <header className="admin-header">
            <div className="admin-header-left">
              <div>
                <span className="admin-badge">
                  ⚙ Panel de administración
                </span>
                <h1 className="admin-title" style={{ marginTop: 10 }}>
                  Bienvenido, <em>{nombreAdmin || "Admin"}</em>
                </h1>
                <p className="admin-subtitle">
                  Cédula: <strong>{cedulaAdmin}</strong> · Administra
                  reservas, marca pagos y libera números
                </p>
              </div>
            </div>

            <Link href="/login" className="admin-logout">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Salir
            </Link>
          </header>

          {/* CONTABILIDAD */}
          <div className="admin-stats">

            <div className="admin-stat-card paid">
              <p className="admin-stat-label">✅ Pagados</p>
              <p className="admin-stat-value">
                {formatPrecio(totalPagado)}
              </p>
              <p className="admin-stat-sub">
                {pagados.length} número{pagados.length === 1 ? "" : "s"} ×{" "}
                {formatPrecio(PRECIO_BOLETA)}
              </p>
            </div>

            <div className="admin-stat-card pending">
              <p className="admin-stat-label">⏳ Por cobrar</p>
              <p className="admin-stat-value">
                {formatPrecio(totalPendiente)}
              </p>
              <p className="admin-stat-sub">
                {pendientes.length} número
                {pendientes.length === 1 ? "" : "s"} ×{" "}
                {formatPrecio(PRECIO_BOLETA)}
              </p>
            </div>

            <div className="admin-stat-card total">
              <p className="admin-stat-label">📊 Total esperado</p>
              <p className="admin-stat-value">
                {formatPrecio(totalGeneral)}
              </p>
              <p className="admin-stat-sub">
                {tickets.length} número
                {tickets.length === 1 ? "" : "s"} reservados
              </p>
            </div>

          </div>

          {/* PANEL GANADOR */}
          <div className="admin-winner-panel">
            <div className="admin-winner-header">
              <span className="admin-winner-icon">🏆</span>
              <div>
                <p className="admin-winner-title">
                  Número ganador
                </p>
                <p className="admin-winner-sub">
                  {numeroGanador !== null
                    ? `Publicado: ${String(
                        numeroGanador
                      ).padStart(2, "0")}`
                    : "Sin asignar"}
                </p>
              </div>
            </div>

            <div className="admin-winner-form">
              <input
  type="text"
  inputMode="numeric"
  placeholder="00"
  maxLength={2}
  value={inputGanador}
  onChange={(e) => {
    // Solo dígitos
    const soloDigitos = e.target.value.replace(/\D/g, "");
    setInputGanador(soloDigitos);
  }}
  onBlur={() => {
    // Al salir del input, formatear a 2 dígitos
    if (inputGanador === "") return;
    const n = parseInt(inputGanador, 10);
    if (isNaN(n) || n < 0 || n > 99) {
      setInputGanador("");
      return;
    }
    setInputGanador(String(n).padStart(2, "0"));
  }}
  className="admin-winner-input"
/>
              <button
                onClick={publicarGanador}
                disabled={publicandoGanador || !inputGanador}
                className="admin-winner-btn publicar"
              >
                {publicandoGanador ? "..." : "Publicar"}
              </button>

              {numeroGanador !== null && (
                <button
                  onClick={borrarGanador}
                  disabled={publicandoGanador}
                  className="admin-winner-btn borrar"
                >
                  Borrar
                </button>
              )}
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="elegant-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* BUSCADOR */}
          <div className="admin-search">
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar por número, cédula o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* TABLA */}
          {ticketsFiltrados.length === 0 ? (
            <div className="admin-table-wrapper">
              <div className="admin-empty">
                {filtro
                  ? `No se encontraron resultados para "${busqueda}"`
                  : "No hay números reservados todavía"}
              </div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Cédula</th>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketsFiltrados.map((ticket) => {
                      const p = participantes[ticket.cedula];
                      const numerosDeEste = getNumerosDe(ticket.cedula);
                      const abierto = detalleAbierto === ticket.id;
                      const numeroFmt = String(ticket.numero).padStart(
                        2,
                        "0"
                      );
                      const esGanador = numeroGanador === ticket.numero;

                      return (
                        <Fragment key={ticket.id}>
                          <tr
                            className={
                              (ticket.pagado ? "paid-row " : "") +
                              (esGanador ? "winner-row" : "")
                            }
                          >
                            <td data-label="Número">
                              <span
                                className={
                                  "admin-numero" +
                                  (ticket.pagado ? " paid" : "") +
                                  (esGanador ? " winner" : "")
                                }
                              >
                                {esGanador ? "🏆 " : ""}
                                {numeroFmt}
                              </span>
                            </td>

                            <td data-label="Cédula">
                              <span className="admin-cedula">
                                {ticket.cedula}
                              </span>
                            </td>

                            <td data-label="Nombre">
                              {p?.nombre || (
                                <span style={{ color: "#9ca3af" }}>
                                  (sin registro)
                                </span>
                              )}
                            </td>

                            <td data-label="Estado">
                              {ticket.pagado ? (
                                <span className="admin-badge-paid">
                                  ✓ Pagado
                                </span>
                              ) : (
                                <span className="admin-badge-pending">
                                  ⏳ Pendiente
                                </span>
                              )}
                            </td>

                            <td data-label="Acciones">
                              <div className="admin-actions">

                                <button
                                  className="admin-btn admin-btn-detail"
                                  onClick={() =>
                                    setDetalleAbierto(
                                      abierto ? null : ticket.id
                                    )
                                  }
                                >
                                  <svg
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d={
                                        abierto
                                          ? "M5 15l7-7 7 7"
                                          : "M19 9l-7 7-7-7"
                                      }
                                    />
                                  </svg>
                                  {abierto ? "Ocultar" : "Ver"}
                                </button>

                                {!ticket.pagado ? (
                                  <button
                                    className="admin-btn admin-btn-pay"
                                    onClick={() => marcarPagado(ticket)}
                                    disabled={procesando === ticket.id}
                                  >
                                    <svg
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    {procesando === ticket.id
                                      ? "..."
                                      : "Pagó"}
                                  </button>
                                ) : (
                                  <span className="admin-btn admin-btn-paid-lock">
                                    🔒 Pagado
                                  </span>
                                )}

                                {!ticket.pagado && (
                                  <button
                                    className="admin-btn admin-btn-free"
                                    onClick={() => liberarNumero(ticket)}
                                    disabled={procesando === ticket.id}
                                  >
                                    <svg
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                                      />
                                    </svg>
                                    Liberar
                                  </button>
                                )}

                              </div>
                            </td>
                          </tr>

                          {abierto && (
                            <tr className="admin-detail-row">
                              <td colSpan={5}>
                                <div className="admin-detail">
                                  <div className="admin-detail-item">
                                    <span className="admin-detail-label">
                                      Nombre
                                    </span>
                                    <span className="admin-detail-value">
                                      {p?.nombre || "—"}
                                    </span>
                                  </div>

                                  <div className="admin-detail-item">
                                    <span className="admin-detail-label">
                                      Cédula
                                    </span>
                                    <span className="admin-detail-value mono">
                                      {ticket.cedula}
                                    </span>
                                  </div>

                                  <div className="admin-detail-item">
                                    <span className="admin-detail-label">
                                      Teléfono
                                    </span>
                                    <span className="admin-detail-value">
                                      {p?.telefono || "—"}
                                    </span>
                                  </div>

                                  <div className="admin-detail-item">
                                    <span className="admin-detail-label">
                                      Correo
                                    </span>
                                    <span className="admin-detail-value">
                                      {p?.correo || "—"}
                                    </span>
                                  </div>

                                  <div className="admin-detail-item">
                                    <span className="admin-detail-label">
                                      Dirección
                                    </span>
                                    <span className="admin-detail-value">
                                      {p?.direccion || "—"}
                                    </span>
                                  </div>

                                  <div className="admin-detail-item">
                                    <span className="admin-detail-label">
                                      Reservado
                                    </span>
                                    <span className="admin-detail-value">
                                      {formatFecha(ticket.created_at)}
                                    </span>
                                  </div>

                                  {ticket.pagado && (
                                    <div className="admin-detail-item">
                                      <span className="admin-detail-label">
                                        Pagado
                                      </span>
                                      <span className="admin-detail-value">
                                        {formatFecha(ticket.pagado_en)}
                                      </span>
                                    </div>
                                  )}

                                  <div
                                    className="admin-detail-item"
                                    style={{ gridColumn: "1 / -1" }}
                                  >
                                    <span className="admin-detail-label">
                                      Otros números de esta cédula (
                                      {numerosDeEste.length})
                                    </span>
                                    <div className="admin-detail-numeros">
                                      {numerosDeEste
                                        .slice()
                                        .sort((a, b) => a.numero - b.numero)
                                        .map((t) => (
                                          <span
                                            key={t.id}
                                            className={
                                              "admin-detail-chip" +
                                              (t.pagado ? " paid" : "") +
                                              (t.id === ticket.id
                                                ? " current"
                                                : "") +
                                              (numeroGanador === t.numero
                                                ? " winner"
                                                : "")
                                            }
                                          >
                                            {String(t.numero).padStart(
                                              2,
                                              "0"
                                            )}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminContenido />
    </Suspense>
  );
}