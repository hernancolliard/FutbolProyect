interface JobPostingSchemaProps {
  offer: {
    id: string;
    titulo: string;
    descripcion: string;
    nombre_ofertante: string;
    created_at: string;
  };
}

const JobPostingSchema = ({ offer }: JobPostingSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: offer.titulo,
    description: offer.descripcion,
    identifier: {
      "@type": "PropertyValue",
      name: "FutbolProyect",
      value: offer.id,
    },
    datePosted: offer.created_at,
    employmentType: "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: offer.nombre_ofertante,
      sameAs: "https://futbolproyect.com",
    },
    industry: "Sports",
    occupationalCategory: "Sports Professionals",
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "AR",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
};

export default JobPostingSchema;
