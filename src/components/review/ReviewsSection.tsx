'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { siteConfig } from '@/config/siteConfig';
import type { Review, ReviewStats } from '@/types/review';

// Tipo extendido para manejar el estado interno del carrusel escalonado
interface CarouselReview extends Review {
  tempId: number;
}

interface TestimonialCardProps {
  position: number;
  review: CarouselReview;
  handleMove: (steps: number) => void;
  cardSize: number;
}

// Componente para la tarjeta del carrusel escalonado
const StaggerCard: React.FC<TestimonialCardProps> = ({ position, review, handleMove, cardSize }) => {
  const isCenter = position === 0;

  // Formateador de fecha es-CL
  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(review.created_at));

  const authorName = review.author_name || 'Anónimo';
  const initial = review.author_name ? review.author_name.charAt(0).toUpperCase() : null;

  return (
    <button
      type="button"
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer rounded-3xl p-6 md:p-8 text-left transition-all duration-500 ease-in-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        isCenter
          ? "z-10 bg-brand text-white border-transparent"
          : "z-0 bg-white text-ink border border-ink/10 hover:border-brand/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -30 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 12px 32px rgba(43,16,38,0.15)" : "0px 4px 12px rgba(43,16,38,0.05)"
      }}
      aria-label={`Leer reseña de ${authorName}`}
      aria-current={isCenter ? "true" : "false"}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-aqua text-ink font-bold text-lg">
          {initial ? initial : <User size={24} />}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold line-clamp-1">{authorName}</span>
          <span className={cn("text-sm", isCenter ? "text-white/80" : "text-ink/60")}>
            {formattedDate}
          </span>
        </div>
      </div>
      
      <div className="flex gap-1 mb-4" aria-label={`Valoración de ${review.rating} sobre 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={cn(
              star <= review.rating 
                ? (isCenter ? "text-aqua fill-current" : "text-brand fill-current")
                : "text-ink/20 fill-current"
            )}
          />
        ))}
      </div>

      <p className="line-clamp-4 text-base leading-relaxed">
        {review.comment}
      </p>
    </button>
  );
};

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<CarouselReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardSize, setCardSize] = useState(365);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);

        const [reviewsResponse, statsResponse] = await Promise.all([
          supabase
            .from('reviews')
            .select('id, rating, author_name, comment, created_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase.rpc('get_review_stats')
        ]);

        if (reviewsResponse.error) throw reviewsResponse.error;
        if (statsResponse.error) throw statsResponse.error;

        // Añadimos un tempId aleatorio para el carrusel y lo asignamos
        const carouselData = (reviewsResponse.data || []).map((r) => ({
          ...r,
          tempId: Math.random()
        }));
        
        setReviews(carouselData);

        // El RPC devuelve un array con una fila según nuestra definición en DB
        const rawStats = Array.isArray(statsResponse.data) ? statsResponse.data[0] : statsResponse.data;
        if (rawStats) {
          setStats({
            avg_rating: rawStats.avg_rating || 0,
            total: rawStats.total || 0
          });
        }
      } catch (err) {
        console.error('Error al cargar reseñas:', err);
        setError('Ocurrió un error al cargar las reseñas. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  // Responsive para el tamaño de la tarjeta
  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Lógica de movimiento del carrusel
  const handleMove = useCallback((steps: number) => {
    setReviews((currentList) => {
      const newList = [...currentList];
      if (steps > 0) {
        for (let i = steps; i > 0; i--) {
          const item = newList.shift();
          if (!item) return newList;
          newList.push({ ...item, tempId: Math.random() });
        }
      } else {
        for (let i = steps; i < 0; i++) {
          const item = newList.pop();
          if (!item) return newList;
          newList.unshift({ ...item, tempId: Math.random() });
        }
      }
      return newList;
    });
  }, []);

  // Navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      handleMove(-1);
    } else if (e.key === 'ArrowRight') {
      handleMove(1);
    }
  };

  if (loading) {
    return (
      <section id="resenas" className="w-full bg-aqua/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-64 bg-ink/10 animate-pulse rounded-md mb-4" />
          <div className="h-24 w-full bg-ink/10 animate-pulse rounded-3xl mt-8" />
        </div>
      </section>
    );
  }

  return (
    <section 
      id="resenas" 
      className="w-full bg-aqua/20 py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl font-semibold text-ink mb-4">
              Lo que dicen de {siteConfig.name}
            </h2>
            {stats && stats.total > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-brand">
                  {stats.avg_rating.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex text-brand">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={star <= Math.round(stats.avg_rating) ? "fill-current" : "text-ink/20 fill-current"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-ink/70 font-medium">
                    Basado en {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estados de error y vacío */}
        {error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : reviews.length === 0 ? (
          <p className="text-ink/70 text-lg">Aún no hay reseñas. ¡Sé la primera!</p>
        ) : reviews.length < 5 ? (
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Grilla simple (menos de 5 reseñas) */}
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-3xl p-6 border border-ink/10 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-aqua text-ink font-bold text-lg">
                    {review.author_name ? review.author_name.charAt(0).toUpperCase() : <User size={24} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink line-clamp-1">{review.author_name || 'Anónimo'}</span>
                    <span className="text-sm text-ink/60">
                      {new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(review.created_at))}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 mb-4 text-brand">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className={star <= review.rating ? "fill-current" : "text-ink/20 fill-current"} />
                  ))}
                </div>
                <p className="text-ink text-base flex-grow">{review.comment}</p>
              </div>
            ))}
          </div>
          
        ) : (
          
          <div 
            className="relative w-full min-h-[550px] outline-none" 
            tabIndex={0} 
            onKeyDown={handleKeyDown}
            aria-label="Carrusel de reseñas. Usa las flechas izquierda y derecha para navegar."
            aria-live="polite"
          >
            {/* Layout escalonado (5 o más reseñas) */}
            {reviews.map((review, index) => {
              const position = reviews.length % 2
                ? index - (reviews.length - 1) / 2
                : index - reviews.length / 2;
                
              return (
                <StaggerCard
                  key={review.tempId}
                  review={review}
                  handleMove={handleMove}
                  position={position}
                  cardSize={cardSize}
                />
              );
            })}

            {/* Controles */}
            <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 gap-4 z-20">
              <button
                onClick={() => handleMove(-1)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-ink/15 text-ink transition-colors hover:bg-brand hover:text-white hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none"
                aria-label="Ver reseñas anteriores"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={() => handleMove(1)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-ink/15 text-ink transition-colors hover:bg-brand hover:text-white hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none"
                aria-label="Ver siguientes reseñas"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}