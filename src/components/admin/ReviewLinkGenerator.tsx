'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

export default function ReviewLinkGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setCopied(false);
    setGeneratedLink(null);

    try {
      const { data: token, error } = await supabase.rpc('create_review_link');
      
      if (error) throw error;

      // Crea la URL completa usando el dominio actual
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const fullUrl = `${baseUrl}/resena/${token}`;
      
      setGeneratedLink(fullUrl);
    } catch (error) {
      console.error('Error al generar el link:', error);
      alert('Error al generar el link. Asegúrate de tener permisos de admin.');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="bg-white border border-ink/10 rounded-2xl p-6 mb-6 max-w-2xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-ink">Generador de Links de Reseña</h3>
          <p className="text-sm text-ink/60">Crea enlaces únicos de un solo uso para enviar a tus clientas.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleGenerate} 
          isLoading={isLoading}
          className="whitespace-nowrap"
        >
          Generar Link
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
            className={copied ? "bg-green-500 hover:bg-green-600 text-white" : ""}
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </Button>
        </div>
      )}
    </div>
  );
}