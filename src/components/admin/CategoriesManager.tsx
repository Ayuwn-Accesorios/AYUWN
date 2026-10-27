'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    const alreadyExists = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      setError('Esa categoría ya existe.');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('categories')
      .insert({ name: trimmed });

    setSaving(false);

    if (insertError) {
      setError(`No se pudo crear la categoría: ${insertError.message}`);
      return;
    }

    setNewName('');
    fetchCategories();
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditingName(c.name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRename = async (id: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    const conflict = categories.some(
      (c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (conflict) {
      setError('Ya existe otra categoría con ese nombre.');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('categories')
      .update({ name: trimmed })
      .eq('id', id);

    setSaving(false);

    if (updateError) {
      setError('No se pudo renombrar la categoría.');
      return;
    }

    cancelEdit();
    fetchCategories();
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        '¿Eliminar esta categoría? Los productos asociados quedarán sin categoría asignada.'
      )
    ) {
      return;
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError('No se pudo eliminar la categoría.');
      return;
    }

    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Categorías ({categories.length})</h2>
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl p-4 shadow-sm max-w-md space-y-3">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Scrunchies"
            className="flex-1 bg-neutral-50 border border-ink/15 rounded-xl px-3.5 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
          />
          <button
            type="submit"
            disabled={saving}
            className="py-2 px-4 rounded-xl bg-brand text-white font-bold text-xs shadow-sm hover:bg-brand/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            + Agregar
          </button>
        </form>
        {error && (
          <p className="text-xs font-semibold text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-center py-12 text-ink/60 font-medium">Cargando...</p>
      ) : categories.length === 0 ? (
        <p className="text-center py-12 text-ink/60 font-medium">
          Aún no hay categorías. Crea la primera arriba.
        </p>
      ) : (
        <div className="space-y-2 max-w-md">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 bg-white border border-ink/10 rounded-xl shadow-sm"
            >
              {editingId === c.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="bg-neutral-50 border border-ink/15 rounded-lg px-2.5 py-1 text-sm outline-none focus:border-brand"
                  autoFocus
                />
              ) : (
                <span className="font-bold text-sm text-ink">{c.name}</span>
              )}

              <div className="flex items-center gap-1">
                {editingId === c.id ? (
                  <>
                    <button
                      onClick={() => handleRename(c.id)}
                      title="Guardar"
                      disabled={saving}
                      className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEdit}
                      title="Cancelar"
                      className="w-7 h-7 rounded-lg bg-neutral-100 text-ink flex items-center justify-center font-bold text-xs"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(c)}
                      title="Renombrar"
                      className="w-7 h-7 rounded-lg border border-ink/10 bg-white text-ink hover:bg-neutral-50 flex items-center justify-center font-bold text-xs"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Eliminar"
                      className="w-7 h-7 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center font-bold text-xs"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}