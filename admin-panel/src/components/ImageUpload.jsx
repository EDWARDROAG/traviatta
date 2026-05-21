/**
 * ======================================================
 * ARCHIVO: ImageUpload.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/ImageUpload.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 22:30
 *
 * 🎯 PROPÓSITO:
 * Componente para la subida y previsualización de
 * imágenes (productos, logos, etc.). Permite arrastrar
 * y soltar archivos, previsualización antes de subir,
 * y eliminación de imágenes existentes.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - ../services/api: Subida a Cloudinary
 *
 * 🔗 RELACIONES:
 * - Importado por: ProductForm.jsx, SettingsPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 22:30
 *    ✅ Creación inicial del archivo
 *    ✅ Previsualización de imágenes
 *    ✅ Subida a Cloudinary
 *    ✅ Arrastrar y soltar
 *    ✅ Eliminación de imagen
 *    ✅ Indicador de carga
 * ======================================================
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

function ImageUpload({ currentImage, onUpload, onRemove, folder = 'products' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    // Previsualización local
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Subir al servidor
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    try {
      const response = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        onUpload(response.data.data.url);
        toast.success('Imagen subida correctamente');
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      toast.error('Error al subir la imagen');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  }, [folder, currentImage, onUpload]);

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) {
      onRemove();
    } else {
      onUpload(null);
    }
    toast.success('Imagen eliminada');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-3">
      {preview ? (
        // Vista previa de la imagen
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Vista previa"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition disabled:opacity-50"
            title="Eliminar imagen"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            </div>
          )}
        </div>
      ) : (
        // Área de subida
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
            ${isDragActive 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
            }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          {isDragActive ? (
            <p className="text-sm text-orange-600">Suelta la imagen aquí...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Arrastra y suelta una imagen aquí, o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Formatos: JPG, PNG, WEBP, GIF (máx. 5MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;