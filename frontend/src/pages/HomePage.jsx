/**
 * Contrato: inicio Traviatta — assets sedes/villa-del-rio por nombre semántico.
 * Consumidores: App ruta `/`.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { CARTA_PATH, SITE, WA_CHAT_URL, waUrl } from '../data/site';

import heroImg from '../assets/sedes/villa-del-rio/header_1.jpg';
import pizzasImg from '../assets/sedes/villa-del-rio/header_1.jpg';
import pastasImg from '../assets/sedes/villa-del-rio/pasta_camaron.jpeg';
import lasagnaImg from '../assets/sedes/villa-del-rio/lasagna.jpg';
import burgerImg from '../assets/sedes/villa-del-rio/hamburguesa.jpg';
import hotdogImg from '../assets/sedes/villa-del-rio/perro_caliente.jpg';
import salchipapaImg from '../assets/sedes/villa-del-rio/salchipapa.jpeg';
import historiaImg from '../assets/sedes/villa-del-rio/mas_de_10_anos.jpg';

const highlights = [
  {
    title: 'Más de 40 sabores de pizzas',
    text: 'En Traviatta Pizza Gourmet, te ofrecemos una experiencia única con más de 40 sabores de pizzas exquisitamente elaboradas, cada una diseñada para deleitar tus sentidos y satisfacer todos tus antojos.',
    image: pizzasImg,
  },
  {
    title: 'Lasañas artesanales',
    text: 'Deléitate con nuestras lasañas artesanales, preparadas con capas de pasta fresca, salsas caseras y una mezcla perfecta de quesos. Cada bocado es una experiencia de sabor, diseñada para satisfacer incluso a los paladares más exigentes.',
    image: lasagnaImg,
  },
  {
    title: 'Pastas al estilo Traviatta',
    text: 'Sumérgete en una experiencia culinaria con nuestras pastas gourmet, elaboradas con recetas tradicionales y un toque de creatividad. Cada plato está preparado con pasta fresca y salsas que realzan el sabor de ingredientes seleccionados, prometiendo una explosión de sabores en cada bocado.',
    image: pastasImg,
  },
  {
    title: 'Hamburguesas 100% artesanales',
    text: 'Disfruta de nuestras hamburguesas 100% artesanales, hechas con carne fresca y jugosa, pan bimbo y los mejores ingredientes. Sabor auténtico en cada mordisco. ¡Solo en Traviatta Pizza Gourmet!',
    image: burgerImg,
  },
  {
    title: 'Perros calientes',
    text: 'La combinación perfecta de calidad y frescura para un festín de sabor que te hará volver por más. ¡Ven y prueba los mejores perros calientes en Traviatta Pizza Gourmet!',
    image: hotdogImg,
  },
  {
    title: 'Salchipapas',
    text: 'Una combinación irresistible de papas fritas crujientes y salchichas jugosas, acompañadas de salsas y aderezos que realzan cada bocado. Perfectas para compartir o para disfrutar solo, ¡son un auténtico festín de sabor en Traviatta Pizza Gourmet!',
    image: salchipapaImg,
  },
];

const HomePage = () => {
  const highlightsRef = useScrollAnimation();
  const historiaRef = useScrollAnimation();

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[70vh] sm:min-h-[75vh] md:min-h-[85vh] flex items-end md:items-center overflow-hidden">
        <img
          src={heroImg}
          alt={SITE.fullName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/50 to-charcoal/20" />
        <div className="relative container-premium py-14 sm:py-20 md:py-28 text-white">
          <p className="text-terracotta-light font-medium tracking-widest uppercase text-xs sm:text-sm mb-3">
            {SITE.fullName} · {SITE.sedeName}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold max-w-3xl mb-4 text-balance">
            Cada plato tiene su magia
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl mb-6 sm:mb-8">
            Experiencia gourmet con pizzas, pastas, lasañas y más, elaboradas con dedicación desde hace más de una década.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link to="/menu" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Ver menú
              </Button>
            </Link>
            <a href={WA_CHAT_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-terracotta"
              >
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section ref={highlightsRef.ref} className="section-premium">
        <Container>
          <SectionHeader title="Nuestra carta" subtitle="Cada plato tiene su magia" />
          <div
            className={`space-y-16 ${highlightsRef.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
          >
            {highlights.map((item, index) => (
              <div
                key={item.title}
                className={`grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center ${
                  index % 2 === 1 ? 'md:[&>div:first-child]:order-2' : ''
                }`}
              >
                <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow-warm aspect-[4/3]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="px-1">
                  <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-charcoal mb-3 sm:mb-4">
                    {item.title}
                  </h3>
                  <div className="separator-organic mb-5 ml-0" />
                  <p className="text-stone leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-premium bg-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeader title="Lo que dicen" subtitle="Nuestros clientes" />
            <blockquote className="font-heading text-xl md:text-2xl text-charcoal leading-relaxed italic mb-6">
              “De todas las pizzas del sector es de lejos la mejor, la calidad de la masa y los
              ingredientes son sobresalientes nada que ver con las típicas pizzas de barrio de
              queso barato y masa regular. Solo mejoraría el tamaño de las mismas, un molde un poco
              más grande estaría bien. Son un poco más costosas que el promedio pero vale la pena
              totalmente. Sigan así.”
            </blockquote>
            <p className="font-semibold text-terracotta">Luis Meneses</p>
          </div>
        </Container>
      </section>

      <section ref={historiaRef.ref} className="section-premium">
        <Container>
          <div
            className={`grid md:grid-cols-2 gap-10 items-center ${
              historiaRef.isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <div className="overflow-hidden rounded-2xl shadow-warm aspect-[4/3]">
              <img
                src={historiaImg}
                alt="Clientes en Traviatta"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                Nuestra historia
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 mb-4">
                Más de 11 años de experiencias gourmet
              </h2>
              <div className="separator-organic mb-6 ml-0" />
              <p className="text-stone leading-relaxed mb-4">
                En Traviatta Pizza Gourmet, llevamos más de 11 años entregando deliciosas
                experiencias gourmet con mucha dedicación y persistencia. Hemos perfeccionado
                nuestras recetas y nos hemos comprometido a ofrecerte la mejor calidad en cada
                plato.
              </p>
              <p className="text-stone leading-relaxed mb-6">
                Así nació un sueño llamado Traviatta Pizza Gourmet. Hace 12 años. ¡Gracias a cada
                uno de nuestros clientes por ser parte de nuestra historia y permitirnos seguir
                creciendo!
              </p>
              <Link to="/nuestra-historia">
                <Button variant="secondary">Conoce más</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 bg-terracotta">
        <Container>
          <div className="text-center text-white max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              ¿Tienes alguna pregunta?
            </h2>
            <p className="text-white/85 mb-8">Escríbenos al WhatsApp</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={waUrl(`Hola ${SITE.fullName}, tengo una pregunta`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-terracotta"
                >
                  Escríbenos
                </Button>
              </a>
              <Link to={CARTA_PATH}>
                <Button variant="text" size="lg" className="text-white hover:text-white/80">
                  Pedir en la carta →
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
