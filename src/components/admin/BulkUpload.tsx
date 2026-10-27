'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';

// Estructura esperada de cada fila del CSV
interface CSVRow {
  producto_titulo: string;
  categoria_nombre: string;
  descripcion: string;
  img_url: string;
  images: string; // Separadas por coma
  badge: string;
  activo: string; // 'true' o 'false'
  es_nuevo: string; // 'true' o 'false'
  variante_label: string;
  precio: string;
  descuento_porcentaje: string;
  color_nombre: string;
  stock: string;
}

export default function BulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const processCSV = async () => {
    if (!file) {
      setMessage('Por favor, selecciona un archivo CSV.');
      return;
    }

    setLoading(true);
    setMessage('Leyendo archivo...');

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          
          setMessage('Procesando categorías...');
          // 1. Obtener o crear categorías
          const categoryNames = [...new Set(rows.map(r => r.categoria_nombre.trim()).filter(Boolean))];
          const categoryMap = new Map<string, number>();

          for (const catName of categoryNames) {
            // Buscar categoría
            let { data: catData } = await supabase
              .from('categories')
              .select('id')
              .eq('name', catName)
              .maybeSingle();

            // Si no existe, crearla
            if (!catData) {
              const { data: newCat, error: insertError } = await supabase
                .from('categories')
                .insert({ name: catName })
                .select('id')
                .single();
                
              if (insertError) throw insertError;
              catData = newCat;
            }
            categoryMap.set(catName, catData.id);
          }

          setMessage('Agrupando productos y enviando a la base de datos...');
          // 2. Agrupar filas por producto_titulo
          const productsGrouped = new Map<string, CSVRow[]>();
          for (const row of rows) {
            const title = row.producto_titulo.trim();
            if (!productsGrouped.has(title)) {
              productsGrouped.set(title, []);
            }
            productsGrouped.get(title)!.push(row);
          }

          // 3. Procesar cada producto agrupado
          let successCount = 0;
          
          for (const [title, productRows] of productsGrouped.entries()) {
            const firstRow = productRows[0];
            
            // Construir p_product_data
            const productData = {
              title: title,
              category_id: categoryMap.get(firstRow.categoria_nombre.trim()) || null,
              description: firstRow.descripcion,
              img_url: firstRow.img_url || null,
              images: firstRow.images ? firstRow.images.split(',').map(s => s.trim()) : [],
              badge: firstRow.badge || null,
              active: firstRow.activo.toLowerCase() === 'true',
              is_new: firstRow.es_nuevo.toLowerCase() === 'true'
            };

            // Extraer variantes únicas
            const variantsMap = new Map<string, any>();
            productRows.forEach(r => {
              const vLabel = r.variante_label.trim();
              if (!variantsMap.has(vLabel)) {
                variantsMap.set(vLabel, {
                  label: vLabel,
                  price: parseInt(r.precio) || 0,
                  discount_percent: parseInt(r.descuento_porcentaje) || 0
                });
              }
            });
            const variantsArray = Array.from(variantsMap.values());

            // Extraer colores únicos
            const colorsMap = new Map<string, any>();
            productRows.forEach(r => {
              const cName = r.color_nombre.trim();
              if (!colorsMap.has(cName)) {
                colorsMap.set(cName, { color_name: cName });
              }
            });
            const colorsArray = Array.from(colorsMap.values());

            // Construir matriz de stock
            const stockMatrix: Record<string, number> = {};
            productRows.forEach(r => {
              const vIndex = variantsArray.findIndex(v => v.label === r.variante_label.trim());
              const cIndex = colorsArray.findIndex(c => c.color_name === r.color_nombre.trim());
              
              if (vIndex !== -1 && cIndex !== -1) {
                stockMatrix[`${vIndex}-${cIndex}`] = parseInt(r.stock) || 0;
              }
            });

            // 4. Llamar al RPC transaccional
            const { error: rpcError } = await supabase.rpc('save_product_transactional', {
              p_product_id: null, // null = crear nuevo producto
              p_product_data: productData,
              p_variants: variantsArray,
              p_colors: colorsArray,
              p_stock_matrix: stockMatrix
            });

            if (rpcError) {
              console.error(`Error insertando ${title}:`, rpcError);
              throw new Error(`Error en producto ${title}: ${rpcError.message}`);
            }
            successCount++;
          }

          setMessage(`¡Carga exitosa! Se importaron ${successCount} productos.`);
        } catch (err: any) {
          console.error(err);
          setMessage(`Error durante la carga: ${err.message}`);
        } finally {
          setLoading(false);
          setFile(null); // Limpiar input
        }
      },
      error: (error) => {
        setMessage(`Error leyendo CSV: ${error.message}`);
        setLoading(false);
      }
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 max-w-xl">
      <h2 className="text-xl font-bold mb-4 text-ink">Carga Masiva de Productos</h2>
      
      <div className="flex flex-col gap-4">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-brand/10 file:text-brand
            hover:file:bg-brand/20 cursor-pointer"
        />
        
        <button
          onClick={processCSV}
          disabled={!file || loading}
          className="px-4 py-2 bg-brand text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Procesando...' : 'Subir y Procesar CSV'}
        </button>

        {message && (
          <p className={`text-sm font-medium p-3 rounded-md ${
            message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}