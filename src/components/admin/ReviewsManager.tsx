'use client';

import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

type Review = {
  id: number;
  rating: number;
  author_name: string | null;
  comment: string;
  status: 'published' | 'hidden';
  created_at: string;
};

export default function ReviewsManager() {
  // Estados para el generador
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Estados para la tabla
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Cargar reseñas al montar el componente
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as Review[]);
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // --- LÓGICA DEL GENERADOR ---
  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);
    setGeneratedLink(null);

    try {
      const { data: token, error } = await supabase.rpc('create_review_link');
      if (error) throw error;

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setGeneratedLink(`${baseUrl}/resena/${token}`);
    } catch (error) {
      console.error('Error al generar el link:', error);
      alert('Error al generar el link. Asegúrate de ser admin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // --- LÓGICA DE GESTIÓN (OCULTAR / BORRAR) ---
  const handleToggleStatus = async (id: number, currentStatus: 'published' | 'hidden') => {
    const newStatus = currentStatus === 'published' ? 'hidden' : 'published';
    
    // Actualización optimista (cambia visualmente al instante)
    setReviews((prev) => 
      prev.map((r) => r.id === id ? { ...r, status: newStatus } : r)
    );

    try {
      const { error } = await supabase.rpc('set_review_status', { 
        p_review_id: id, 
        p_status: newStatus 
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      // Revertir si falla
      setReviews((prev) => 
        prev.map((r) => r.id === id ? { ...r, status: currentStatus } : r)
      );
      alert('Hubo un error al actualizar el estado.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta reseña definitivamente?')) return;

    try {
      const { error } = await supabase.rpc('delete_review', { p_review_id: id });
      if (error) throw error;

      // Quitar de la lista local
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Hubo un error al eliminar la reseña.');
    }
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: GENERADOR */}
      <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-ink">Generador de Links de Reseña</h3>
            <p className="text-sm text-ink/60">Crea enlaces únicos de un solo uso para enviar a tus clientas por WhatsApp.</p>
          </div>
          <Button 
            variant="primary" 
            onClick={handleGenerate} 
            isLoading={isGenerating}
            className="whitespace-nowrap bg-brand hover:bg-brand/90"
          >
            Generar nuevo link
          </Button>
        </div>

        {generatedLink && (
          <div className="flex items-center gap-2 mt-4 p-4 bg-ink/5 rounded-xl animate-in fade-in slide-in-from-top-2">
            <Input 
              value={generatedLink} 
              readOnly 
              className="bg-white cursor-text font-mono text-xs md:text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button 
              variant={copied ? "primary" : "ghost"} 
              onClick={handleCopy}
              className={copied ? "bg-green-500 hover:bg-green-600 text-white border-transparent" : "border-ink/20"}
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </Button>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: LISTA DE RESEÑAS */}
      <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-ink/10">
          <h3 className="text-lg font-bold text-ink">Reseñas Recibidas</h3>
        </div>

        {isLoadingReviews ? (
          <div className="p-8 text-center text-ink/50 text-sm">Cargando reseñas...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-ink/50 text-sm">Aún no hay reseñas registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-ink/5 text-ink/70">
                <tr>
                  <th className="px-6 py-3 font-semibold">Fecha</th>
                  <th className="px-6 py-3 font-semibold">Cliente</th>
                  <th className="px-6 py-3 font-semibold">Nota</th>
                  <th className="px-6 py-3 font-semibold min-w-75">Comentario</th>
                  <th className="px-6 py-3 font-semibold text-center">Estado</th>
                  <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {reviews.map((review) => (
                  <tr key={review.id} className={review.status === 'hidden' ? 'bg-ink/5 opacity-75' : ''}>
                    <td className="px-6 py-4 text-ink/70">
                      {new Date(review.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 font-medium text-ink">
                      {review.author_name || <span className="text-ink/40 italic">Anónima</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-brand">
                        <Star size={16} fill="currentColor" />
                        <span className="font-bold text-ink">{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink/80 whitespace-normal min-w-75 max-w-100">
                      {review.comment}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                        review.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-ink/20 text-ink/70'
                      }`}>
                        {review.status === 'published' ? 'Pública' : 'Oculta'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botón Ocultar/Mostrar */}
                        <button
                          onClick={() => handleToggleStatus(review.id, review.status)}
                          className="p-2 rounded-lg text-ink/60 hover:bg-ink/10 hover:text-ink transition-colors"
                          title={review.status === 'published' ? 'Ocultar reseña' : 'Publicar reseña'}
                        >
                          {review.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {/* Botón Borrar */}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Eliminar definitivamente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}