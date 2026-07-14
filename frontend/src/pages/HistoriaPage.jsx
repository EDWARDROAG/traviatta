/**
 * Contrato: Nuestra historia — textos alineados a traviatta.com/services/.
 * Consumidores: App ruta `/nuestra-historia`.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { SITE, WA_CHAT_URL } from '../data/site';
import historiaImg from '../assets/sedes/villa-del-rio/mas_de_10_anos.jpg';
import ambientImg from '../assets/sedes/villa-del-rio/nuestros_inicios.jpeg';

const HistoriaPage = () => {
  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <img
          src={historiaImg}
          alt={`Historia de ${SITE.fullName}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/45 to-charcoal/20" />
        <div className="relative container-premium py-14 text-white">
          <p className="uppercase tracking-widest text-sm text-white/70 mb-2">Nuestra historia</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold max-w-2xl">
            Una década de pasión y sabor
          </h1>
        </div>
      </section>

      <section className="section-premium">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-10">
              <article>
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-3">
                  Una década de pasión y sabor
                </h2>
                <div className="separator-organic mb-4 ml-0" />
                <p className="text-stone leading-relaxed">
                  Hace diez años, en un pequeño barrio de la ciudad, Traviatta Pizza Gourmet
                  comenzó con la visión y el entusiasmo de una pareja emprendedora con un sueño en
                  común: ofrecer pizzas de calidad y un servicio excepcional. Con muchas ganas de
                  salir adelante y construir algo especial, decidieron poner en marcha su proyecto,
                  basado en su amor por la buena comida y su deseo de crear un lugar único para los
                  amantes de la pizza.
                </p>
              </article>

              <article>
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-3">
                  Desde el primer día
                </h2>
                <div className="separator-organic mb-4 ml-0" />
                <p className="text-stone leading-relaxed">
                  El enfoque de la pareja fue claro: no solo querían servir pizzas, sino ofrecer una
                  experiencia culinaria memorable. Con ingredientes frescos y recetas auténticas,
                  comenzaron a construir una reputación en la comunidad, un bocado a la vez.
                </p>
              </article>

              <article>
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-3">Una década</h2>
                <div className="separator-organic mb-4 ml-0" />
                <p className="text-stone leading-relaxed">
                  Al celebrar una década de éxitos, queremos agradecer a nuestros clientes, amigos
                  y al equipo que ha hecho posible este viaje. Cada uno de ustedes ha sido parte
                  fundamental de nuestra historia y de nuestro éxito.
                </p>
              </article>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl shadow-warm aspect-[3/4]">
                <img
                  src={ambientImg}
                  alt="Plato Traviatta"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-warm">
                <p className="text-stone leading-relaxed mb-4">
                  En Traviatta Pizza Gourmet, llevamos más de 11 años entregando deliciosas
                  experiencias gourmet. Así nació un sueño llamado Traviatta Pizza Gourmet — hace
                  12 años.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/menu">
                    <Button variant="primary">Ver menú</Button>
                  </Link>
                  <a href={WA_CHAT_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary">WhatsApp</Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HistoriaPage;
