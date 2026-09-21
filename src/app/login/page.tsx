"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!cedula.trim() || !password.trim()) {
      setError("Completa los dos campos.");
      return;
    }

    if (cedula !== password) {
      setError("La contraseña debe ser tu misma cédula.");
      return;
    }

    // Aquí conectaremos con la base de datos (Paso siguiente)
    console.log("Entrar con cédula:", cedula);
  }

  return (
    <main className="min-h-screen flex flex-col px-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center space-y-3">
            <Link
              href="/"
              className="inline-block text-gold text-xs tracking-[0.4em] uppercase hover:text-bone transition"
            >
              ← Rifa Solidaria
            </Link>
            <h1 className="font-serif text-3xl text-bone">Entrar</h1>
            <p className="text-muted text-sm">
              Ingresa con tu cédula para participar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="cedula"
                className="block text-xs tracking-[0.3em] uppercase text-muted"
              >
                Cédula
              </label>
              <input
                id="cedula"
                type="text"
                inputMode="numeric"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="w-full bg-carbon-soft border border-gold-dim focus:border-gold outline-none px-4 py-3 text-bone text-lg tracking-wider transition"
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs tracking-[0.3em] uppercase text-muted"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                inputMode="numeric"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-carbon-soft border border-gold-dim focus:border-gold outline-none px-4 py-3 text-bone text-lg tracking-wider transition"
                placeholder="Tu misma cédula"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gold text-carbon py-4 text-sm tracking-[0.3em] uppercase font-medium transition-all hover:bg-bone hover:tracking-[0.4em]"
            >
              Entrar
            </button>
          </form>

          <p className="text-muted text-xs text-center leading-relaxed">
            Si es tu primera vez, se creará tu cuenta automáticamente.
          </p>

        </div>
      </div>
    </main>
  );
}