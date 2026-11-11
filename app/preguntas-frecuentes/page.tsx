import React from 'react';
import Link from 'next/link';

export default function PreguntasFrecuentesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 font-sans text-ink">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-ink/60 hover:text-ink font-semibold transition-colors">
          ← Volver al inicio
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold text-ink mb-3">Preguntas Frecuentes</h1>
      <p className="text-sm text-ink/70 mb-8 leading-relaxed">
        Encuentra respuestas rápidas a las dudas más comunes sobre nuestros accesorios, pedidos y envíos.
      </p>

      <section className="space-y-6 text-sm leading-relaxed">
        {/* Sección: Sobre los Pedidos y Compras */}
        <div>
          <h2 className="text-lg font-bold text-ink mb-2">🛒 Sobre los Pedidos y Compras</h2>
          <div className="bg-neutral-50 p-5 rounded-2xl border-l-4 border-brand space-y-4 shadow-sm text-ink/80">
            <div>
              <strong className="text-ink">¿Cómo puedo realizar un pedido?</strong>
              <p className="mt-1">
                Puedes revisar nuestro catálogo en la web, seleccionar los colores o combinaciones de tus accesorios favoritos y agregarlos al carro de compras para coordinar por WhatsApp.
              </p>
            </div>
            <div>
              <strong className="text-ink">¿Cuáles son los medios de pago disponibles?</strong>
              <p className="mt-1">
                Puedes pagar tus compras mediante transferencia bancaria o con tarjeta de débito y crédito a través de un link de pago que te enviaremos por WhatsApp. 💗
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Sobre las Entregas y Envíos */}
        <div>
          <h2 className="text-lg font-bold text-ink mb-2">📦 Sobre las Entregas y Envíos</h2>
          <div className="bg-neutral-50 p-5 rounded-2xl border-l-4 border-brand space-y-4 shadow-sm text-ink/80">
            <div>
              <strong className="text-ink">¿Hacen entregas en Talca y envíos a regiones?</strong>
              <p className="mt-1">¡Sí! 💗</p>
              <p className="mt-1">
                En Talca contamos con puntos de retiro y entrega gratuitos, previa coordinación. También ofrecemos despacho a domicilio desde $2.000, según la distancia.
              </p>
              <p className="mt-1">
                Realizamos envíos a todo Chile a través de Starken y Blue Express, bajo la modalidad por pagar. 🌸
              </p>
            </div>
            <div>
              <strong className="text-ink">¿Cuánto tarda en entregarse mi pedido?</strong>
              <p className="mt-1">
                💗 En Talca, los retiros y entregas se coordinan previamente, según disponibilidad.
              </p>
              <p className="mt-1">
                🌸 Para envíos a regiones, entregamos tu pedido al courier en un plazo máximo de 3 días hábiles desde la confirmación del pago. El tiempo de traslado dependerá de la empresa seleccionada.
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Cuidados de los Accesorios */}
        <div>
          <h2 className="text-lg font-bold text-ink mb-2">🎀 Cuidados de los Accesorios</h2>
          <div className="bg-neutral-50 p-5 rounded-2xl border-l-4 border-brand space-y-4 shadow-sm text-ink/80">
            <div>
              <strong className="text-ink">¿Cómo lavo y cuido mis accesorios Ayuwn?</strong>
              <p className="mt-1">
                💗 Recomendamos lavar a mano con agua fría y jabón suave, sin frotar ni retorcer. Dejar secar a la sombra, evitando la secadora y el calor directo.
              </p>
              <p className="mt-1">
                ¡Así conservarás por más tiempo sus colores, formas y elasticidad! 🌸
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}