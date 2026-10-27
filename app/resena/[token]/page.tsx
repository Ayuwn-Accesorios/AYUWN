import { Metadata } from 'next';
import ReviewForm from '@/components/review/ReviewForm';

// Metadata con desindexación según las reglas para rutas de un solo uso
export const metadata: Metadata = {
  title: 'Deja tu reseña',
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: Props) {
  // En Next.js 16 (App Router), los params de las rutas dinámicas son promesas
  const { token } = await params;

  return (
    <div className="min-h-screen bg-aqua/15 py-12 px-4 flex items-center justify-center font-sans">
      <ReviewForm token={token} />
    </div>
  );
}