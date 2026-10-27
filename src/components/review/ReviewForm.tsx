'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { siteConfig } from '@/config/siteConfig';

type Status = 'loading' | 'valid' | 'used' | 'expired' | 'invalid' | 'success';

const RATING_LABELS: Record<number, string> = {
  1: 'Mala',
  2: 'Regular',
  3: 'Buena',
  4: 'Muy buena',
  5: 'Excelente',
};

export default function ReviewForm({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>('loading');
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validación UUID v4
  const isValidUUID = (id: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  };

  useEffect(() => {
    const checkToken = async () => {
      if (!isValidUUID(token)) {
        setStatus('invalid');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_review_link_status', { p_token: token });
        
        if (error) throw error;
        
        setStatus(data as Status);
      } catch (err) {
        console.error('Error al validar el link de reseña:', err);
        setStatus('invalid');
      }
    };

    checkToken();
  }, [token]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!rating) return;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setRating(Math.min(5, rating + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setRating(Math.max(1, rating - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Anti-bots
    if (honeypot.trim() !== '') {
      setStatus('success');
      return;
    }

    if (!rating || comment.length < 10) return;

    setIsSubmitting(true);

    try {
      const finalAuthorName = isAnonymous || authorName.trim() === '' ? null : authorName.trim();

      const { error } = await supabase.rpc('submit_review', {
        p_token: token,
        p_rating: rating,
        p_author_name: finalAuthorName,
        p_comment: comment.trim(),
      });

      if (error) {
        let mappedError = 'No pudimos enviar tu reseña. Intenta de nuevo.';
        const errStr = error.message?.toLowerCase() || '';

        if (errStr.includes('ya fue usado')) mappedError = 'Este link ya fue usado.';
        else if (errStr.includes('venció')) mappedError = 'Este link venció.';
        else if (errStr.includes('inválido')) mappedError = 'Link inválido.';
        else if (errStr.includes('enlaces')) mappedError = 'Por favor no incluyas enlaces en tu opinión.';
        
        setErrorMessage(mappedError);
        setIsSubmitting(false);
      } else {
        setStatus('success');
      }
    } catch (err) {
      setErrorMessage('No pudimos enviar tu reseña. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="max-w-lg w-full bg-white rounded-3xl border border-ink/10 p-8 shadow-sm flex flex-col items-center animate-pulse">
        <div className="w-48 h-8 bg-ink/5 rounded-md mb-4" />
        <div className="w-32 h-4 bg-ink/5 rounded-md mb-8" />
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-10 h-10 bg-ink/5 rounded-full" />)}
        </div>
        <div className="w-full h-32 bg-ink/5 rounded-xl mb-4" />
        <div className="w-full h-12 bg-ink/10 rounded-xl" />
      </div>
    );
  }

  if (status !== 'valid' && status !== 'success') {
    const messageMap = {
      used: 'Este link ya fue usado, ¡gracias por tu reseña!',
      expired: 'Este link venció. Pídele uno nuevo a la tienda.',
      invalid: 'Link inválido.',
    };

    return (
      <div className="max-w-lg w-full bg-white rounded-3xl border border-ink/10 p-8 shadow-sm text-center">
        <h2 className="text-2xl font-semibold text-ink mb-4">Ups</h2>
        <p className="text-ink/70 mb-8">{messageMap[status as 'used' | 'expired' | 'invalid']}</p>
        <Link href="/" tabIndex={-1}>
          <Button variant="ghost" className="w-full">
            Volver a la tienda
          </Button>
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg w-full bg-white rounded-3xl border border-ink/10 p-8 shadow-sm text-center">
        <h2 className="text-2xl font-bold text-ink mb-2">¡Gracias por tu reseña!</h2>
        <p className="text-ink/70 mb-6">Tu opinión nos ayuda muchísimo a seguir mejorando.</p>
        
        <div className="flex justify-center gap-1 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon 
              key={star} 
              filled={!!rating && star <= rating} 
              className="w-8 h-8" 
            />
          ))}
        </div>

        <Link href="/" tabIndex={-1}>
          <Button variant="primary" className="w-full">
            Volver a la tienda
          </Button>
        </Link>
      </div>
    );
  }

  const activeRating = hoverRating || rating;
  const isSubmitDisabled = !rating || comment.length < 10 || isSubmitting;

  return (
    <div className="max-w-lg w-full bg-white rounded-3xl border border-ink/10 p-6 md:p-8 shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-ink">Cuéntanos cómo te fue</h1>
        <p className="text-ink/60 mt-1">{siteConfig.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 w-0">
          <input 
            type="text" 
            name="website" 
            tabIndex={-1} 
            value={honeypot} 
            onChange={(e) => setHoneypot(e.target.value)} 
          />
        </div>

        <div className="flex flex-col items-center">
          <div 
            className="flex gap-2 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-lg p-1"
            role="radiogroup" 
            aria-label="Calificación de 1 a 5 estrellas"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <label 
                key={star} 
                className="cursor-pointer touch-manipulation transition-transform active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
              >
                <input 
                  type="radio" 
                  name="rating" 
                  value={star} 
                  className="sr-only" 
                  aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                  checked={rating === star}
                  onChange={() => setRating(star)}
                />
                <StarIcon 
                  filled={!!activeRating && star <= activeRating} 
                  className="w-10 h-10 md:w-12 md:h-12"
                />
              </label>
            ))}
          </div>
          <span className="text-sm font-medium text-ink/70 mt-2 h-5">
            {activeRating ? RATING_LABELS[activeRating] : 'Selecciona una nota'}
          </span>
        </div>

        <div className="bg-ink/5 p-4 rounded-2xl space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 text-brand bg-white border-ink/20 rounded focus:ring-brand focus:ring-2"
            />
            <span className="text-ink font-medium text-sm">Publicar como anónima</span>
          </label>
          
          {!isAnonymous && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label htmlFor="authorName" className="block text-sm text-ink/70 mb-1">
                Tu nombre
              </label>
              <Input
                id="authorName"
                maxLength={40}
                placeholder="Ej. Camila S."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-ink mb-2">
            Tu opinión
          </label>
          <textarea
            id="comment"
            rows={4}
            maxLength={500}
            placeholder="¿Qué te pareció el producto? ¿Cómo fue la atención?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border border-ink/20 p-3 bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${comment.length < 10 || comment.length === 500 ? 'text-brand font-medium' : 'text-ink/50'}`}>
              {comment.length}/500 {comment.length < 10 && '(mínimo 10)'}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {errorMessage}
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitDisabled} 
          isLoading={isSubmitting}
          className="w-full"
        >
          Enviar reseña
        </Button>
      </form>
    </div>
  );
}

function StarIcon({ filled, className = '' }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={`${className} transition-colors duration-150 ${filled ? 'text-brand' : 'text-ink/20'}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}