import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '1rem' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <h2>Página no encontrada</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>La ruta a la que intentas acceder no existe o fue movida.</p>
      <Link href="/" style={{ backgroundColor: '#4a2c11', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none' }}>
        Volver al inicio
      </Link>
    </div>
  );
}