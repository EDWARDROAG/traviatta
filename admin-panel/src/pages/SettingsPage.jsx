/**
 * ======================================================
 * ARCHIVO: SettingsPage.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/pages/SettingsPage.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 21:15
 *
 * 🎯 PROPÓSITO:
 * Página de configuración general del restaurante.
 * Permite actualizar información del negocio, logo,
 * colores, horarios, WhatsApp y configuración de
 * domicilio.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 * - ../components/ImageUpload: Subida de logo
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 21:15
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración general
 *    ✅ Cambio de logo
 *    ✅ Colores personalizados
 *    ✅ Horarios de atención
 *    ✅ Configuración de WhatsApp
 *    ✅ Configuración de domicilio
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  BuildingStorefrontIcon, 
  PaintBrushIcon, 
  ClockIcon, 
  DevicePhoneMobileIcon,
  TruckIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    whatsapp_number: '',
    primary_color: '#FF6B35',
    logo_url: '',
  });
  
  const [schedule, setSchedule] = useState({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '10:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false },
  });

  const [deliverySettings, setDeliverySettings] = useState({
    enabled: true,
    cost: 3000,
    free_delivery_min_amount: 30000,
    estimated_time: '30-45',
  });

  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const response = await api.get('/admin/settings');
      if (response.data.success) {
        const data = response.data.data;
        setSettings({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          whatsapp_number: data.whatsapp_number || '',
          primary_color: data.primary_color || '#FF6B35',
          logo_url: data.logo_url || '',
        });
        
        if (data.settings?.schedule) {
          setSchedule(data.settings.schedule);
        }
        
        if (data.settings?.delivery) {
          setDeliverySettings(data.settings.delivery);
        }
      }
    } catch (error) {
      toast.error('Error al cargar la configuración');
    } finally {
      setFetching(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliverySettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (imageUrl) => {
    setSettings(prev => ({ ...prev, logo_url: imageUrl }));
  };

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      const response = await api.put('/admin/settings', {
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        whatsapp_number: settings.whatsapp_number,
        primary_color: settings.primary_color,
      });
      if (response.data.success) {
        toast.success('Configuración guardada');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      const response = await api.put('/admin/settings/schedule', { schedule });
      if (response.data.success) {
        toast.success('Horarios guardados');
      }
    } catch (error) {
      toast.error('Error al guardar los horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDelivery = async () => {
    setLoading(true);
    try {
      const response = await api.put('/admin/settings/delivery', { 
        delivery_settings: deliverySettings 
      });
      if (response.data.success) {
        toast.success('Configuración de domicilio guardada');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveColors = async () => {
    setLoading(true);
    try {
      const response = await api.put('/admin/settings/colors', {
        primary_color: settings.primary_color,
      });
      if (response.data.success) {
        toast.success('Colores actualizados');
      }
    } catch (error) {
      toast.error('Error al guardar los colores');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: BuildingStorefrontIcon },
    { id: 'schedule', label: 'Horarios', icon: ClockIcon },
    { id: 'colors', label: 'Apariencia', icon: PaintBrushIcon },
    { id: 'whatsapp', label: 'WhatsApp', icon: DevicePhoneMobileIcon },
    { id: 'delivery', label: 'Domicilio', icon: TruckIcon },
    { id: 'qr', label: 'Código QR', icon: QrCodeIcon },
  ];

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Administra la configuración de tu restaurante</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* General */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Información del restaurante</h3>
              <button
                onClick={handleSaveGeneral}
                disabled={loading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del restaurante
                </label>
                <input
                  type="text"
                  name="name"
                  value={settings.name}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo del restaurante
              </label>
              <ImageUpload
                currentImage={settings.logo_url}
                onUpload={handleLogoUpload}
                folder="logos"
              />
            </div>
          </div>
        )}

        {/* Horarios */}
        {activeTab === 'schedule' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Horarios de atención</h3>
              <button
                onClick={handleSaveSchedule}
                disabled={loading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar horarios'}
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(schedule).map(([day, daySchedule]) => (
                <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-32">
                    <span className="font-medium capitalize">{day}</span>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!daySchedule.closed}
                      onChange={(e) => handleScheduleChange(day, 'closed', !e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">Abierto</span>
                  </label>
                  {!daySchedule.closed && (
                    <>
                      <input
                        type="time"
                        value={daySchedule.open}
                        onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg"
                      />
                      <span>a</span>
                      <input
                        type="time"
                        value={daySchedule.close}
                        onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apariencia */}
        {activeTab === 'colors' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Personalización de colores</h3>
              <button
                onClick={handleSaveColors}
                disabled={loading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar colores'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color principal
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primary_color"
                  value={settings.primary_color}
                  onChange={handleSettingsChange}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="primary_color"
                  value={settings.primary_color}
                  onChange={handleSettingsChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Este color se usará en botones, enlaces y elementos destacados del menú.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Vista previa:</p>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  Botón principal
                </button>
                <button
                  className="px-4 py-2 rounded-lg border"
                  style={{ borderColor: settings.primary_color, color: settings.primary_color }}
                >
                  Botón secundario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp */}
        {activeTab === 'whatsapp' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Configuración de WhatsApp</h3>
              <button
                onClick={handleSaveGeneral}
                disabled={loading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de WhatsApp
              </label>
              <input
                type="tel"
                name="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={handleSettingsChange}
                placeholder="573001112233"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Incluye el código del país sin el símbolo + (ej: 573001112233)
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                💡 Los pedidos llegarán automáticamente a este número de WhatsApp.
                Los clientes solo tendrán que presionar "Enviar".
              </p>
            </div>
          </div>
        )}

        {/* Domicilio */}
        {activeTab === 'delivery' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Configuración de domicilio</h3>
              <button
                onClick={handleSaveDelivery}
                disabled={loading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={deliverySettings.enabled}
                  onChange={(e) => setDeliverySettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium">Habilitar domicilios</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de envío (COP)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={deliverySettings.cost}
                    onChange={handleDeliveryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Envío gratis en pedidos mayores a (COP)
                  </label>
                  <input
                    type="number"
                    name="free_delivery_min_amount"
                    value={deliverySettings.free_delivery_min_amount}
                    onChange={handleDeliveryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo estimado (minutos)
                  </label>
                  <input
                    type="text"
                    name="estimated_time"
                    value={deliverySettings.estimated_time}
                    onChange={handleDeliveryChange}
                    placeholder="30-45"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Código QR */}
        {activeTab === 'qr' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Código QR del menú</h3>
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-white border rounded-lg">
                {/* Aquí se generaría el QR dinámicamente */}
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                  <QrCodeIcon className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <div className="mt-4">
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg">
                  Descargar QR
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Escanea este código QR para acceder al menú digital.
                Imprime y pega en tu local, mesas o vitrinas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;