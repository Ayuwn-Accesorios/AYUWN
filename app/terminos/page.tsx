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
        
        {/* 1. Generalidades */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">1. Generalidades</h2>
          <p>
            ¡Bienvenida a Ayuwn! Queremos que tu experiencia sea sencilla y transparente. Al confirmar tu compra aceptas estas condiciones, que podremos actualizar para compras futuras, respetando siempre tus derechos.
          </p>
        </section>

        {/* 2. Precios y disponibilidad */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">2. Precios y disponibilidad</h2>
          <p>
            Los precios están expresados en pesos chilenos (CLP) e incluyen los impuestos correspondientes. Los despachos se cobran por separado cuando aplican. Los productos están sujetos a stock; si surge un problema de disponibilidad, te contactaremos por WhatsApp para ofrecerte una solución.
          </p>
        </section>

        {/* 3. Envíos y despachos */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">3. Envíos y despachos</h2>
          <div>
            <h3 className="font-semibold text-ink">Talca</h3>
            <p className="mt-1">
              Contamos con un punto de retiro y un punto de entrega sin costo, ambos con coordinación previa. El despacho a domicilio u otra dirección dentro de Talca tiene un costo desde $2.000, según la distancia, que informaremos antes de confirmar la compra. Se acuerda el día de entrega, pero no un horario exacto.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-ink mt-3">Regiones</h3>
            <p className="mt-1">
              Enviamos a todo Chile por Starken o Blue Express, bajo modalidad por pagar: el transporte lo paga la clienta al recibir o retirar la encomienda. La tarifa la fija el courier según destino, peso, medidas y valores vigentes al despacho; podemos orientar con un monto estimado antes de la compra. Entregamos el pedido al courier dentro de un máximo de 3 días hábiles desde la confirmación del pago, salvo un plazo de preparación diferente acordado previamente. El tiempo de traslado depende de la agencia y el destino.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-ink mt-3">Seguimiento</h3>
            <p className="mt-1">
              Empacamos cuidadosamente cada pedido. Si ocurre un atraso, extravío o daño durante el transporte, escríbenos por WhatsApp para ayudarte con el seguimiento y las gestiones que correspondan, sin perjuicio de tus derechos legales. Proporciona datos de contacto y dirección completos.
            </p>
          </div>
        </section>

        {/* 4. Cambios, devoluciones y garantía */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">4. Cambios, devoluciones y garantía</h2>
          <p>
            Si un producto no era lo que esperabas, puedes solicitar su devolución dentro de los 10 días siguientes a su recepción, conforme al derecho a retracto cuando corresponda. Los accesorios deben estar sin uso, en buen estado y con sus elementos y embalajes originales en buen estado. Un pack se devuelve completo. Coordina el retorno por WhatsApp; los costos de retorno se asumirán según lo que corresponda legalmente.
          </p>
          <p>
            Si aparece una falla de fabricación, la garantía legal aplicable es de 6 meses y permite optar por las soluciones que establece la ley. No cubre daños causados por mal uso o desgaste normal. Para solicitar atención, contáctanos por WhatsApp con tu comprobante y una descripción del problema.
          </p>
        </section>

        {/* 5. Compras y medios de pago */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">5. Compras y medios de pago</h2>
          <p>
            Elige tus productos en la tienda y finaliza el carrito: serás dirigida automáticamente a WhatsApp para completar la compra. El carrito y las consultas no reservan productos; la reserva se confirma con el pago. Aceptamos transferencias bancarias y los medios que te informemos durante la compra. Te confirmaremos por escrito el pedido y las condiciones acordadas.
          </p>
        </section>

        {/* 6. Pedidos personalizados */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">6. Pedidos personalizados</h2>
          <p>
            Los accesorios confeccionados especialmente según tus indicaciones requieren pago total anticipado. Antes del pago acordaremos por WhatsApp diseños, combinaciones, precio y plazo. En estos pedidos, cuando corresponda la excepción legal y esta haya sido informada previamente de manera destacada, no se aceptan cancelaciones ni devoluciones por simple cambio de opinión una vez confirmada la compra. Se mantienen los derechos frente a fallas o incumplimientos.
          </p>
        </section>

        {/* 7. Compras mayoristas */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">7. Compras mayoristas</h2>
          <p>
            Ofrecemos precios especiales desde 12 unidades de un mismo tipo de accesorio. Puedes elegir diseños y colores según disponibilidad. El pedido se confirma con pago total. Los plazos de preparación parten desde 5 días hábiles y pueden aumentar por cantidad o confección desde cero; siempre acordaremos el plazo antes del pago. En pedidos mayoristas para reventa, las devoluciones voluntarias por cambio de opinión se aceptan solo por el pedido completo, sin uso y en buen estado, sin limitar los derechos que correspondan por ley.
          </p>
        </section>

        {/* 8. Privacidad y contacto */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">8. Privacidad y contacto</h2>
          <p>
            Usamos tus datos de contacto y despacho para gestionar pedidos, pagos, entregas y consultas. Solo los compartimos cuando es necesario para prestar el servicio o cumplir obligaciones legales. Puedes escribirnos por nuestros canales oficiales para hacer consultas o ejercer los derechos que correspondan sobre tus datos. La información completa debe estar disponible en nuestra Política de Privacidad.
          </p>
          <p className="font-semibold text-ink pt-2 border-t border-neutral-200 mt-2">
            Gracias por elegir Ayuwn. Celebra tu belleza. Abraza tu poder.
          </p>
        </section>

      </div>
    </main>
  );
}