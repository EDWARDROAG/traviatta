/**
 * Contrato: Contacto + CTA WhatsApp (mismo número del sistema Traviatta).
 * Consumidores: App ruta `/contacto`.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { CARTA_PATH, SITE, WA_CHAT_URL, waUrl } from '../data/site';
import contactImg from '../assets/sedes/villa-del-rio/entrada.jpeg';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-cream">
      <section className="section-premium">
        <Container>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-terracotta font-medium text-sm uppercase tracking-wider mb-2">
                Contacto
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal mb-4">
                ¿Tienes alguna pregunta?
              </h1>
              <div className="separator-organic mb-6 ml-0" />
              <p className="text-stone text-lg leading-relaxed mb-8">
                Escríbenos al WhatsApp. Te respondemos para pedidos, domicilios o cualquier
                consulta sobre {SITE.fullName}.
              </p>

              <ul className="space-y-3 text-charcoal mb-8">
                <li>
                  <a
                    href={WA_CHAT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-terracotta transition-smooth font-medium"
                  >
                    WhatsApp: {SITE.phoneDisplay}
                  </a>
                </li>
                <li>📍 {SITE.city}</li>
                <li>✉️ {SITE.email}</li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={waUrl(`Hola ${SITE.fullName}, quiero hacer un pedido`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="lg">
                    Escríbenos
                  </Button>
                </a>
                <Link to={CARTA_PATH}>
                  <Button variant="secondary" size="lg">
                    Ver carta digital
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-warm aspect-[4/5]">
              <img
                src={contactImg}
                alt={`Contacto ${SITE.fullName}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ContactPage;
