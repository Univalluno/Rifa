import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col px-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl text-center space-y-8">
          <p className="text-gold text-xs tracking-[0.4em] uppercase">
            Rifa Solidaria
          </p>

          <h1 className="font-serif text-4xl md:text-6xl leading-tight text-bone">
            Participa con una boleta de{" "}
            <span className="text-gold">$15.000</span> y gana{" "}
            <span className="text-gold">$500.000</span>
          </h1>

          <p className="text-muted text-base md:text-lg leading-relaxed">
            Tu aporte será de gran ayuda. ¡Gracias por apoyar y compartir!
          </p>

          <div className="h-px w-24 mx-auto bg-gold-dim" />

          <p className="text-bone text-sm tracking-widest uppercase">
            Chontico Noche · 9 de octubre de 2026
          </p>

          <div className="pt-6 space-y-3">
            <Link
              href="/login"
              className="inline-block bg-gold text-carbon px-12 py-4 text-sm tracking-[0.3em] uppercase font-medium transition-all hover:bg-bone hover:tracking-[0.4em]"
            >
              Participar
            </Link>
            <p className="text-muted text-xs">Solo toma 30 segundos</p>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center">
        <p className="text-muted text-xs tracking-widest uppercase">
          Gracias por apoyar
        </p>
      </footer>
    </main>
  );
}