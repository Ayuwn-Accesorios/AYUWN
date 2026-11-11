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
        {/* Sección: Nuestra Historia */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Nuestra Historia</h2>
          <p>
            <strong>Ayuwn</strong> nació de un sueño, del amor por crear y de la ilusión de transformar pequeños detalles en momentos especiales. 💗
          </p>
          <p>
            Nuestro nombre significa alegría en mapudungun, y esa es justamente la esencia que queremos compartir.
          </p>
          <p>
            Desde Talca, creamos accesorios llenos de color, personalidad y dedicación, donde cada diseño busca acompañarte a expresar tu estilo y sentirte única.
          </p>
          <p>
            Creemos en la belleza de ser auténticas, en los sueños que se construyen con esfuerzo y en el poder que tenemos las mujeres para reinventarnos. Porque Ayuwn es mucho más que accesorios: es una invitación a celebrar quién eres.
          </p>
          <p className="font-semibold text-ink">
            Celebra tu belleza. Abraza tu poder. 🌸
          </p>
        </section>

        {/* Sección: Calidad y Cuidado */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Calidad y Cuidado</h2>
          <p>
            En <strong>Ayuwn Accesorios</strong> creemos que la belleza está en los pequeños detalles. 💗
          </p>
          <p>
            Creamos nuestros propios diseños textiles, inspirados en las distintas personalidades de las mujeres Ayuwn. Seleccionamos cuidadosamente cada tela, color y textura para dar vida a accesorios únicos, llenos de estilo y personalidad.
          </p>
          <p>
            Cada pieza es confeccionada artesanalmente en Talca, cuidando sus terminaciones y cada pequeño detalle.
          </p>
          <p>
            Porque en Ayuwn creemos que hay un diseño especial para cada forma de ser. 🌸
          </p>
        </section>

        {/* Sección: Atención local y envíos */}
        <section className="bg-neutral-50 p-6 rounded-2xl border-l-4 border-brand space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Atención local y envíos</h2>
          <p>
            Desde Talca, llevamos la alegría de Ayuwn a distintos rincones de Chile. 💗
          </p>
          <p>
            Contamos con opciones de retiro y entrega local, además de envíos a todo el país.
          </p>
          <p>
            Nos encanta acompañarte en cada compra, brindándote una atención cercana y personalizada para que tu experiencia sea tan especial como el accesorio que elegiste. 🌸
          </p>
        </section>
      </div>
    </main>
  );
}