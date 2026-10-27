export const siteConfig = {
  name: 'Ayüwn',
  tagline: 'Accesorios para el pelo',
  description:
    'Scrunchies, Rumbas, Rufi y accesorios para el pelo. Elige tu color y pide por WhatsApp.',
  
  // Variables de entorno con fallback a string vacío
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? '',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? '',

  hero: {
    // Se escriben en este orden y vuelven a empezar.
    words: ['Ayuwn', 'Scrunchies', 'Rumbas', 'Rufi', 'Turbantes', 'Cintas'],
    // Frase que aparece al final del scroll.
    outro: 'Un detalle para cada día',
    // Ruta configurada con la imagen del scrunchie colorido:
    image: '/images/hero/hero-product.png',
    imageAlt: 'Cole de tela Ayuwn',
  },
} as const;