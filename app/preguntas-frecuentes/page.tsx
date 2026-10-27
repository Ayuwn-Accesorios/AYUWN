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
        <div>
          <h2 className="text-lg font-bold text-ink mb-2">🛒 Sobre los Pedidos y Compras</h2>
          <div className="bg-neutral-50 p-5 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm text-ink/80">
            <p>
              <strong className="text-ink">¿Cómo puedo realizar un pedido?</strong>
              <br />
              Puedes revisar nuestro catálogo en la web, seleccionar los colores o combinaciones de tus accesorios favoritos y agregarlos al carro de compras para coordinar por WhatsApp.
            </p>
            <p>
              <strong className="text-ink">¿Cuáles son los medios de pago disponibles?</strong>
              <br />
              Aceptamos transferencias bancarias directas y pago en efectivo al momento de coordinar tu entrega o retiro.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-ink mb-2">📦 Sobre las Entregas y Envíos</h2>
          <div className="bg-neutral-50 p-5 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm text-ink/80">
            <p>
              <strong className="text-ink">¿Hacen entregas en Talca y a regiones?</strong>
              <br />
              ¡Sí! Realizamos entregas y despachos locales dentro de Talca, además de envíos a todo Chile a través de Starken o Chilexpress por pagar.
            </p>
            <p>
              <strong className="text-ink">¿Cuánto tarda en entregarse mi pedido?</strong>
              <br />
              Para retiros y despachos dentro de Talca, coordinamos las entregas en un plazo de 24 a 48 horas hábiles. Para otras regiones, el tiempo de tránsito dependerá de la empresa de envíos seleccionada.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-ink mb-2">🎀 Cuidados de los Accesorios</h2>
          <div className="bg-neutral-50 p-5 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm text-ink/80">
            <p>
              <strong className="text-ink">¿Cómo lavo y cuido mis scrunchies o coles?</strong>
              <br />
              Recomendamos lavar a mano tus accesorios de satín o tela delicada utilizando agua fría y un detergente suave. Secar a la sombra para proteger el brillo del tejido y la elasticidad de las gomas internas.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}