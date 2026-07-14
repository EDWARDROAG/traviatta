/**
 * Contrato: rutas públicas Traviatta — Inicio, Menú, Nuestra historia, Contacto + carta digital.
 * Consumidores: main.jsx.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import MenuPresencePage from './pages/MenuPresencePage';
import MenuPage from './pages/MenuPage';
import HistoriaPage from './pages/HistoriaPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TableMenuPage from './pages/TableMenuPage';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <div className="text-center p-8 animate-fade-in-up">
      <h1 className="font-heading text-6xl font-bold text-terracotta mb-4">404</h1>
      <p className="text-charcoal text-lg mb-2">Página no encontrada</p>
      <p className="text-stone mb-6">Lo sentimos, la página que buscas no existe.</p>
      <a href="/" className="btn-primary inline-block">
        Volver al inicio
      </a>
    </div>
  </div>
);

const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow pt-16">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />

      <Route
        path="/menu"
        element={
          <MainLayout>
            <MenuPresencePage />
          </MainLayout>
        }
      />

      <Route
        path="/nuestra-historia"
        element={
          <MainLayout>
            <HistoriaPage />
          </MainLayout>
        }
      />

      <Route
        path="/contacto"
        element={
          <MainLayout>
            <ContactPage />
          </MainLayout>
        }
      />

      <Route
        path="/cart"
        element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        }
      />

      <Route
        path="/checkout"
        element={
          <MainLayout>
            <CheckoutPage />
          </MainLayout>
        }
      />

      <Route path="/reservas" element={<Navigate to="/contacto" replace />} />
      <Route path="/mesa/:slug/:tableId" element={<TableMenuPage />} />

      {/* Carta digital QR — slug en URL (ej. /traviatta/menu) */}
      <Route
        path="/:slug/menu"
        element={
          <MainLayout>
            <MenuPage />
          </MainLayout>
        }
      />

      <Route
        path="*"
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
