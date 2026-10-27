'use client';

import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ImageUploadFieldProps {
  bucket?: 'product-images';
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  altText?: string;
}

const compressImage = (file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No se pudo procesar el contexto del canvas.');

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject('Error al comprimir la imagen.');
        },
        'image/webp',
        quality
      );
    };
    img.onerror = (err) => reject(err);
  });
};

async function computeContentHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function ImageUploadField({
  bucket = 'product-images',
  value = [],
  onChange,
  label,
  altText,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeValue = value || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith('image/')) {
        setError('Todos los archivos deben ser imágenes.');
        return;
      }
    }

    setError(null);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const compressedBlob = await compressImage(file, 1200, 0.82);
        const hash = await computeContentHash(compressedBlob);
        const fileName = `${hash}.webp`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, compressedBlob, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
          });

        if (uploadError && !uploadError.message?.includes('already exists') && !uploadError.message?.includes('Duplicate')) {
          throw uploadError;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      onChange([...safeValue, ...uploadedUrls]);
    } catch (err) {
      console.error('Error de subida de imagen:', err);
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      setError(`No se pudo subir la imagen: ${message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const filtered = safeValue.filter((_, idx) => idx !== indexToRemove);
    onChange(filtered);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-ink">{label}</label>}

      {/* Grid de previsualización */}
      <div className="flex flex-wrap gap-2">
        {safeValue.map((url, idx) => (
          <div
            key={url + idx}
            className={`relative w-16 h-16 rounded-xl overflow-hidden border ${
              idx === 0 ? 'border-brand ring-2 ring-brand/20' : 'border-ink/15'
            }`}
          >
            <img
              src={url}
              alt={altText ? `${altText} ${idx + 1}` : 'Vista previa'}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1 right-1 w-4 h-4 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
              title="Eliminar imagen"
            >
              ✕
            </button>
            {idx === 0 && (
              <span className="absolute bottom-0 inset-x-0 bg-brand text-white text-[8px] font-bold text-center py-0.5">
                Principal
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Zona de click/Drop */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-ink/20 rounded-xl p-4 text-center bg-neutral-50 hover:bg-neutral-100/80 transition-colors cursor-pointer"
      >
        <span className="text-xs font-semibold text-ink/70">
          {uploading ? 'Comprimiendo y subiendo...' : '+ Agregar imágenes'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}