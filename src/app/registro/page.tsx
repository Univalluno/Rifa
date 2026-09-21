"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistroPage() {
  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    telefono: "",
    direccion: "",
    correo: "",
  });
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.cedula.trim() || !form.nombre.trim() || !form.telefono.trim() || !form.direccion.trim()) {
      setError("Completa los campos obligatorios.");
      return;
    }

    // Aquí conectaremos con Supabase (siguiente paso)
    console.log("Registro:", form);
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-12">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center space-y-3">
            <Link
              href="/login"
              className="inline-block text-gold text-xs tracking-[0.4em] uppercase hover:text-bone transition"
            >
              ← Volver
            </Link>
            <h1 className="font-serif text-3xl text-bone">Registro</h1>
            <p className="text-muted text-sm">
              Completa tus datos para participar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <label className="block text-xs tracking-[0.3em] uppercase text-muted">
                Cédula *
              </label>
              <input
                name="cedula"
                type="text"
                inputMode="numeric"
                value={form.cedula}
                onChange={handleChange}
                className="w-full bg-carbon-soft border border-gold-dim focus:border-gold outline-none px-4 py-3 text-bone transition"
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs tracking-[0.3em] uppercase text-muted">
                Nombre completo *
              </label>
              <input
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                className="w-full bg-carbon-soft border border-gold-dim focus:border-gold outline-none px-4 py-3 text-bone transition"
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs tracking-[0.3em] uppercase text-muted">
                Teléfono / WhatsApp *
              </label>
              <input
                name="telefono"
                type="tel"
                inputMode="tel"
                value={form.telefono}
                onChange={handleChange}
                className="w-full bg-carbon-soft border border-gold-dim focus:border-gold outline-none px-4 py-3 text-bone transition"
                placeholder="300 123 4567"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs tracking-[0.3em] uppercase text-muted">
                Dirección de residencia *
              </label>
              <input
                name="direccion"
                type="text"
                value={form.direccion}
                onChange={handleChange}
                className="w-full bg-carbon-soft border border-gold-dim focus:border-gold outline-none px-4 py-3 text-bone transition"
                placeholder="Calle 1 # 2-34, Barrio"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs tracking-[0.3em] uppercase text-muted">
                Correo (opcional)
              </label>
              <input
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                className="w-full bg-carbon-soft border border-gold-dim focus:border-gold outline-none px-4 py-3 text-bone transition"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gold text-carbon py-4 text-sm tracking-[0.3em] uppercase font-medium transition-all hover:bg-bone hover:tracking-[0.4em]"
            >
              Continuar
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}