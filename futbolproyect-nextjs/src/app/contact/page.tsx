import React from 'react';
import ContactPageClient from '@/components/client-components/ContactPageClient';

// SEO Metadata for the page
export const metadata = {
  title: "Contacto - FutbolProyect",
  description: "Ponte en contacto con el equipo de FutbolProyect. Envíanos tus preguntas, sugerencias o consultas a través de nuestro formulario de contacto.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}