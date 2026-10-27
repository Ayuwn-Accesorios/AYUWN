import React from 'react';
import Link from 'next/link';

export default function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 font-sans text-ink">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-ink/60 hover:text-ink font-semibold transition-colors">
          ← Volver al inicio
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold text-ink mb-3">Términos y Condiciones</h1>
      <p className="text-sm text-ink/70 mb-8 leading-relaxed">
        Consulta las condiciones generales de uso, compras y envíos de nuestra tienda.
      </p>

      <div className="space-y-6 text-sm text-ink/80 leading-relaxed">
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-2 shadow-sm">
          <h2 className="text-lg font-bold text-ink">1. Generalidades</h2>
          <p>
            Al realizar un pedido en <strong>[AYWN]</strong>, el cliente acepta los términos y condiciones aquí descritos. Nos reservamos el derecho de actualizar o modificar estos términos cuando sea necesario para mejorar el servicio.
          </p>
        </section>

        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-2 shadow-sm">
          <h2 className="text-lg font-bold text-ink">2. Precios y Disponibilidad</h2>
          <p>
            Todos los precios expuestos en nuestro sitio web corresponden a pesos chilenos (CLP) y están sujetos a disponibilidad de stock de telas y variantes. En caso de no contar con stock de algún insumo en particular, nos pondremos en contacto directamente vía WhatsApp.
          </p>
        </section>

        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-2 shadow-sm">
          <h2 className="text-lg font-bold text-ink">3. Envíos y Despachos</h2>
          <p>
            Es responsabilidad del cliente proporcionar la dirección de despacho o datos de contacto de manera clara y precisa. <strong>[AYWN]</strong> realiza despachos en Talca y envíos a regiones. Los costos de envío externo corren por cuenta del cliente a través del servicio de encomienda acordado.
          </p>
        </section>

        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-2 shadow-sm">
          <h2 className="text-lg font-bold text-ink">4. Cambios y Garantía</h2>
          <p>
            Dado que nuestros accesorios de cabello son productos de uso personal e higiénico, los cambios o devoluciones aplican únicamente en caso de fallas de fábrica dentro de los primeros 10 días desde la recepción del producto.
          </p>
        </section>
      </div>
    </main>
  );
}