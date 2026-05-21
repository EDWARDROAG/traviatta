/**
 * ======================================================
 * ARCHIVO: ProductForm.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/ProductForm.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 20:15
 *
 * 🎯 PROPÓSITO:
 * Componente de formulario modal para la creación y
 * edición de productos. Incluye campos para nombre,
 * descripción, precio, imagen, categoría, y opciones
 * avanzadas como modificadores/extras.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hook-form: Manejo de formularios
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 * - ./ImageUpload: Subida de imágenes
 *
 * 🔗 RELACIONES:
 * - Importado por: ProductsPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 20:15
 *    ✅ Creación inicial del archivo
 *    ✅ Campos del formulario
 *    ✅ Subida de imágenes
 *    ✅ Gestión de modificadores
 *    ✅ Validación de datos
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import ImageUpload from './ImageUpload';

function ProductForm({ product, categories, branches, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchCategories, setBranchCategories] = useState([]);

  const { register, control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true,
      is_featured: false,
      preparation_time: '',
      allergens: [],
      tags: [],
      modifiers: [],
      image_url: '',
    }
  });

  const { fields: modifierFields, append, remove } = useFieldArray({
    control,
    name: 'modifiers'
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category_id: product.category_id || '',
        is_available: product.is_available !== false,
        is_featured: product.is_featured || false,
        preparation_time: product.preparation_time || '',
        allergens: product.allergens || [],
        tags: product.tags || [],
        modifiers: product.modifiers || [],
        image_url: product.image_url || '',
      });
    }
  }, [product, reset]);

  useEffect(() => {
    if (selectedBranch) {
      fetchCategoriesByBranch(selectedBranch);
    }
  }, [selectedBranch]);

  const fetchCategoriesByBranch = async (branchId) => {
    try {
      const response = await api.get(`/admin/branch/${branchId}/categories`);
      if (response.data.success) {
        setBranchCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = (imageUrl) => {
    setValue('image_url', imageUrl);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'modifiers') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      let response;
      if (product) {
        response = await api.put(`/admin/products/${product.id}`, data);
      } else {
        response = await api.post('/admin/products', data);
      }

      if (response.data.success) {
        toast.success(product ? 'Producto actualizado' : 'Producto creado');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const addModifier = () => {
    append({ name: '', price: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del producto
            </label>
            <ImageUpload
              currentImage={watch('image_url')}
              onUpload={handleImageUpload}
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              rows="3"
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Sede y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sede
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Seleccionar sede</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                {...register('category_id', { required: 'La categoría es requerida' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Seleccionar categoría</option>
                {branchCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Precio y tiempo preparación */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (COP) *
              </label>
              <input
                type="number"
                step="100"
                {...register('price', { required: 'El precio es requerido', min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo preparación (min)
              </label>
              <input
                type="number"
                {...register('preparation_time')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Modificadores */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Extras / Modificadores
              </label>
              <button
                type="button"
                onClick={addModifier}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" /> Agregar extra
              </button>
            </div>
            {modifierFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <input
                  {...register(`modifiers.${index}.name`)}
                  placeholder="Nombre (ej: Queso extra)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  {...register(`modifiers.${index}.price`)}
                  placeholder="Precio"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Opciones */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('is_available')}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Disponible</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Destacado</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;