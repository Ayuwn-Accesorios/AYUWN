import React from 'react';
import Link from 'next/link';

export default function NosotrosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 font-sans text-ink">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-ink/60 hover:text-ink font-semibold transition-colors">
          ← Volver al inicio
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold text-ink mb-3">Sobre Nosotros</h1>
      <p className="text-sm text-ink/70 mb-8 leading-relaxed">
        Diseñamos y elaboramos accesorios para el cabello pensados para acompañarte todos los días.
      </p>

      <div className="space-y-6 text-sm text-ink/80 leading-relaxed">
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Nuestra Historia</h2>
          <p>
            <strong>[AYWN]</strong> nació en Talca con la idea de transformar un accesorio esencial de uso diario en una pieza de diseño única, cómoda y con estilo. Nos especializamos en la confección de coles, scrunchies y accesorios para el pelo que no solo destacan por sus colores y texturas, sino también por el cuidado con el que tratamos cada tipo de cabello.
          </p>
        </section>

        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Calidad y Cuidado</h2>
          <p>
            Seleccionamos cuidadosamente telas suaves como satín, terciopelo y algodones de alta calidad para evitar los tirones, el frizz y el quiebre de las hebras capilares. Cada pieza es confeccionada a mano en Talca de manera artesanal, cuidando cada costura y detalle para brindarte la máxima durabilidad y comodidad.
          </p>
        </section>

        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Atención Local y Envíos</h2>
          <p>
            Desde Talca, atendemos pedidos locales con opción de retiro o despacho, además de realizar envíos a todas las regiones de Chile. Queremos que disfrutes de una experiencia de compra cercana, rápida y confiable.
          </p>
        </section>
      </div>
    </main>
  );
}