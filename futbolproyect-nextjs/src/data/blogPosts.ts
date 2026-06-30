export type BlogSection = {
  heading: string;
  subheading?: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  image: string;
  imageAlt: string;
  author: string;
  content: BlogSection[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  relatedSlugs: string[];
  cta: {
    label: string;
    href: string;
    description: string;
  };
};

export const blogPosts: BlogPost[] = [
  {
    slug: "como-conseguir-club-de-futbol",
    title: "Cómo conseguir club de fútbol: guía completa para jugadores",
    description:
      "Un plan concreto para presentar tu trayectoria, encontrar oportunidades y contactar clubes de forma profesional.",
    category: "Jugadores",
    date: "2026-06-25",
    image: "/images/jugador-estadio-futbol.webp",
    imageAlt: "Jugador de fútbol preparándose para buscar un club",
    author: "Equipo FutbolProyect",
    seoTitle: "Cómo conseguir club de fútbol: guía para jugadores",
    seoDescription:
      "Aprendé a conseguir club de fútbol con un perfil profesional, CV deportivo, video de highlights y una estrategia de contacto efectiva.",
    keywords: [
      "cómo conseguir club de fútbol",
      "buscar equipo de fútbol",
      "pruebas de fútbol",
      "perfil de jugador",
      "CV deportivo",
    ],
    relatedSlugs: [
      "como-hacer-cv-deportivo-futbol",
      "como-crear-perfil-jugador-futbol",
    ],
    cta: {
      label: "Creá tu perfil gratis en FutbolProyect",
      href: "/register",
      description:
        "Reuní tu trayectoria, fotos, videos y datos de contacto en un enlace profesional.",
    },
    content: [
      {
        heading: "Prepará una presentación que responda lo esencial",
        subheading: "Tu información debe poder evaluarse en pocos minutos",
        paragraphs: [
          "Conseguir club no depende solamente de enviar muchos mensajes. El primer paso es facilitarle el trabajo a quien evalúa jugadores. Un entrenador, scout o director deportivo necesita entender rápidamente quién sos, dónde jugás y qué podés aportar.",
          "Armá una presentación breve con nombre, edad, nacionalidad, altura, pierna hábil, posición principal y secundaria, club actual, disponibilidad y datos de contacto. Sumá tu trayectoria en orden cronológico y evitá afirmar estadísticas que no puedas respaldar.",
        ],
        bullets: [
          "Una foto actual, clara y deportiva.",
          "CV deportivo en PDF, de una o dos páginas.",
          "Video de highlights breve y un partido completo reciente.",
          "Enlace único a tu perfil profesional.",
          "Teléfono y correo que revises con frecuencia.",
        ],
      },
      {
        heading: "Creá un CV y un video que muestren tu nivel real",
        subheading: "Calidad y contexto antes que efectos",
        paragraphs: [
          "El CV ordena tu experiencia; el video permite observar decisiones y ejecución. En los highlights, identificá tu posición antes de cada jugada, usá imágenes nítidas y empezá con tus acciones más representativas. Tres a cinco minutos suelen ser suficientes.",
          "También conviene compartir un partido completo. Los recortes muestran virtudes, pero un encuentro permite evaluar ubicación, intensidad, continuidad y comportamiento sin pelota. Si todavía no tenés buen material, priorizá grabar partidos oficiales o entrenamientos competitivos.",
        ],
      },
      {
        heading: "Buscá oportunidades compatibles con tu perfil",
        subheading: "Definí un mercado realista",
        paragraphs: [
          "No todas las oportunidades son adecuadas para todos los jugadores. Filtrá por categoría, país, posición, edad, nivel competitivo y condiciones económicas. Revisá las ofertas publicadas y estudiá al club antes de iniciar un contacto.",
          "Registrá en una planilla a qué clubes escribiste, cuándo lo hiciste, quién respondió y cuál es el próximo paso. Esa organización evita mensajes repetidos y convierte una búsqueda improvisada en un proceso sostenido.",
        ],
        bullets: [
          "Seguí clubes y ligas donde tu experiencia sea relevante.",
          "Respondé ofertas que especifiquen posición y requisitos.",
          "Pedí condiciones y responsables identificables antes de viajar.",
          "Nunca pagues por una prueba sin verificar identidad y antecedentes.",
        ],
      },
      {
        heading: "Contactá con criterio y hacé seguimiento",
        subheading: "Un mensaje profesional abre más puertas",
        paragraphs: [
          "Personalizá cada presentación. Explicá en dos o tres líneas por qué tu perfil puede encajar, adjuntá un solo enlace y cerrá con una pregunta concreta. Evitá archivos pesados, audios extensos y mensajes genéricos enviados en masa.",
          "Si no recibís respuesta, hacé un seguimiento respetuoso después de siete a diez días. Mientras tanto, mantené actualizado tu perfil en FutbolProyect, revisá nuevas oportunidades y seguí entrenando. La constancia funciona mejor cuando está acompañada por una presentación sólida y objetivos realistas.",
        ],
      },
    ],
  },
  {
    slug: "como-hacer-cv-deportivo-futbol",
    title: "Cómo hacer un CV deportivo profesional para enviar a clubes",
    description:
      "Qué información incluir, cómo ordenar tu trayectoria y qué errores evitar al preparar tu currículum futbolístico.",
    category: "CV Deportivo",
    date: "2026-06-20",
    image: "/images/estadio-futbol-1.webp",
    imageAlt: "Cancha de fútbol como fondo de un currículum deportivo",
    author: "Equipo FutbolProyect",
    seoTitle: "Cómo hacer un CV deportivo profesional de fútbol",
    seoDescription:
      "Guía para crear un CV deportivo de fútbol con datos personales, trayectoria, estadísticas, videos, fotos y contacto profesional.",
    keywords: [
      "CV deportivo fútbol",
      "currículum futbolista",
      "modelo CV jugador",
      "enviar CV a clubes",
    ],
    relatedSlugs: [
      "como-crear-perfil-jugador-futbol",
      "como-conseguir-club-de-futbol",
    ],
    cta: {
      label: "Creá tu perfil gratis en FutbolProyect",
      href: "/register",
      description:
        "Complementá tu CV con un perfil online que puedas actualizar y compartir.",
    },
    content: [
      {
        heading: "Empezá con datos deportivos claros",
        subheading: "La primera lectura debe ser inmediata",
        paragraphs: [
          "El encabezado tiene que identificarte sin ocupar media página. Incluí nombre completo, fecha de nacimiento o edad, ciudad y país de residencia, nacionalidad, altura, peso, pierna hábil, posición principal y posiciones alternativas.",
          "Agregá un correo profesional, teléfono con código internacional y un enlace a tu perfil. No hace falta incluir número de documento, dirección exacta ni información sensible. Una foto deportiva actual es suficiente.",
        ],
      },
      {
        heading: "Ordená la trayectoria de lo reciente a lo anterior",
        subheading: "Contextualizá cada experiencia",
        paragraphs: [
          "Para cada club indicá temporada, institución, país, categoría y competición. Si participaste en juveniles, reserva y primera, diferenciá cada etapa. Las pruebas sin incorporación pueden mencionarse aparte, pero no deben presentarse como contratos.",
          "Las estadísticas ayudan cuando son verificables y comparables. Partidos, minutos, goles, asistencias, vallas invictas o tarjetas dependen de la posición. Aclarar la competición y la temporada hace que los números tengan sentido.",
        ],
        bullets: [
          "Temporada y nombre oficial del club.",
          "División, categoría y torneo disputado.",
          "Partidos y minutos, si contás con registros fiables.",
          "Logros colectivos o reconocimientos relevantes.",
        ],
      },
      {
        heading: "Sumá videos y referencias útiles",
        subheading: "El CV debe conducir a evidencia",
        paragraphs: [
          "Insertá enlaces clickeables a un video de highlights, un partido completo y tu perfil de jugador. Probá todos los enlaces antes de enviar el documento y configurá los videos para que puedan verse sin solicitar permiso.",
          "Podés sumar una o dos referencias de entrenadores o coordinadores que hayan aceptado ser contactados. Indicá nombre, función, club y un medio de contacto. Una referencia verificable aporta más que una larga lista de cualidades personales.",
        ],
      },
      {
        heading: "Evitá los errores que dificultan la evaluación",
        subheading: "Una edición simple transmite profesionalismo",
        paragraphs: [
          "Usá una tipografía legible, buen contraste y títulos consistentes. Exportá el CV como PDF con un nombre reconocible, por ejemplo nombre-apellido-cv-futbol.pdf. Una o dos páginas alcanzan en la mayoría de los casos.",
          "No exageres logros, no incluyas videos verticales de baja calidad como única evidencia y no envíes el mismo texto a cualquier destinatario. Actualizá el documento cada vez que cambies de club, incorpores material o completes una temporada.",
        ],
        bullets: [
          "Faltas de ortografía y fechas contradictorias.",
          "Diseño recargado que compite con la información.",
          "Estadísticas sin temporada ni competición.",
          "Enlaces rotos o archivos que requieren permisos.",
          "Datos de contacto antiguos.",
        ],
      },
    ],
  },
  {
    slug: "como-crear-perfil-jugador-futbol",
    title: "Cómo crear un perfil de jugador para mostrarte a clubes, agencias y scouts",
    description:
      "Convertí tu información deportiva en un enlace profesional, completo y fácil de compartir con quienes buscan talento.",
    category: "Perfil de jugador",
    date: "2026-06-15",
    image: "/images/home-hero-stadium.webp",
    imageAlt: "Estadio de fútbol asociado a un perfil profesional de jugador",
    author: "Equipo FutbolProyect",
    seoTitle: "Cómo crear un perfil de jugador de fútbol profesional",
    seoDescription:
      "Creá un perfil de jugador con fotos, videos, trayectoria, estadísticas y contacto para mostrarte a clubes, agencias y scouts.",
    keywords: [
      "perfil de jugador de fútbol",
      "mostrarme a clubes",
      "perfil futbolista online",
      "scouts de fútbol",
    ],
    relatedSlugs: [
      "como-hacer-cv-deportivo-futbol",
      "como-conseguir-club-de-futbol",
    ],
    cta: {
      label: "Creá tu perfil gratis en FutbolProyect",
      href: "/register",
      description:
        "Publicá tu información deportiva y compartila desde un único enlace.",
    },
    content: [
      {
        heading: "Pensá el perfil como tu presentación central",
        subheading: "Un enlace siempre actualizado",
        paragraphs: [
          "Un perfil online reúne la información que suele quedar dispersa entre mensajes, archivos y redes sociales. Cuando un club recibe un único enlace puede revisar tus datos, trayectoria, fotos y videos sin descargar adjuntos ni pedir accesos.",
          "A diferencia de un PDF, el perfil se actualiza sin cambiar el enlace. Esto permite usar la misma dirección en correos, mensajes, redes y formularios de postulación.",
        ],
      },
      {
        heading: "Completá primero la información que define tu juego",
        subheading: "Precisión antes que cantidad",
        paragraphs: [
          "Indicá posición principal, alternativas reales, pierna hábil, medidas, edad, nacionalidad, residencia y disponibilidad. En la descripción, resumí tu estilo con ejemplos concretos: funciones que cumplís, sistemas en los que jugaste y fortalezas observables.",
          "La trayectoria debe coincidir con tu CV. Usá nombres oficiales, temporadas y categorías. Si estás sin club, expresalo con claridad; la disponibilidad es información útil para quien recluta.",
        ],
        bullets: [
          "Foto de perfil nítida y con fondo simple.",
          "Imagen de portada vinculada al fútbol.",
          "Trayectoria ordenada y sin períodos ambiguos.",
          "Estadísticas con su fuente o contexto.",
          "Contacto directo y actualizado.",
        ],
      },
      {
        heading: "Elegí material visual que permita evaluarte",
        subheading: "Mostrá acciones relevantes para tu posición",
        paragraphs: [
          "Seleccioná fotos actuales y evitá subir muchas imágenes similares. En video, combiná highlights con al menos un partido completo. Un arquero, un central y un delantero deben priorizar acciones diferentes; el montaje tiene que representar lo que hacés con frecuencia.",
          "Revisá el perfil desde un celular. Los scouts suelen abrir enlaces mientras se desplazan y la información principal debe encontrarse rápido. También comprobá que tu nombre, foto y título se vean bien cuando compartís el enlace.",
        ],
      },
      {
        heading: "Mantenelo activo y usalo con intención",
        subheading: "Tu perfil mejora con cada actualización",
        paragraphs: [
          "Actualizá club, categoría, estadísticas y videos durante la temporada. Compartí el enlace al responder ofertas compatibles y al contactar instituciones que hayas investigado. Acompañalo siempre con un mensaje breve y personalizado.",
          "En FutbolProyect, el perfil convive con oportunidades y búsquedas del sector. Eso no reemplaza tu trabajo de contacto, pero ofrece una presentación consistente para que clubes, agencias y scouts puedan entender tu recorrido y comunicarse.",
        ],
      },
    ],
  },
  {
    slug: "como-encontrar-jugadores-para-club",
    title: "Cómo encontrar jugadores para un club de fútbol",
    description:
      "Un proceso ordenado para definir necesidades, buscar perfiles, publicar ofertas y evaluar candidatos.",
    category: "Clubes y scouts",
    date: "2026-06-10",
    image: "/images/estadio-futbol.webp",
    imageAlt: "Estadio donde un club realiza búsqueda de jugadores",
    author: "Equipo FutbolProyect",
    seoTitle: "Cómo encontrar jugadores para un club de fútbol",
    seoDescription:
      "Definí el perfil, buscá futbolistas, publicá ofertas y organizá la evaluación de jugadores para tu club o agencia.",
    keywords: [
      "encontrar jugadores de fútbol",
      "buscar futbolistas para club",
      "scouting de jugadores",
      "publicar prueba de fútbol",
    ],
    relatedSlugs: [
      "como-crear-perfil-jugador-futbol",
      "como-ser-analista-de-datos-en-futbol",
    ],
    cta: {
      label: "Publicá una oferta para encontrar jugadores",
      href: "/create-offer",
      description:
        "Detallá tu búsqueda y recibí postulaciones de perfiles interesados.",
    },
    content: [
      {
        heading: "Traducí la necesidad deportiva a criterios de búsqueda",
        subheading: "Acordá el perfil antes de mirar nombres",
        paragraphs: [
          "Una búsqueda eficiente comienza con una definición compartida entre dirección deportiva, cuerpo técnico y scouting. Además de la posición, describí funciones, edad objetivo, experiencia, disponibilidad, presupuesto y restricciones reglamentarias.",
          "Separá requisitos obligatorios de preferencias. Esta distinción evita descartar jugadores útiles por una condición secundaria y ayuda a comparar candidatos con el mismo criterio.",
        ],
        bullets: [
          "Rol dentro del modelo de juego.",
          "Nivel y competiciones de referencia.",
          "Edad, nacionalidad y situación contractual.",
          "Plazo de incorporación y ubicación.",
          "Presupuesto total disponible.",
        ],
      },
      {
        heading: "Combiná búsqueda de perfiles y publicación de ofertas",
        subheading: "Dos caminos para ampliar el alcance",
        paragraphs: [
          "La búsqueda directa permite revisar perfiles que cumplen criterios concretos. Observá trayectoria, posición, videos y datos de contacto antes de armar una lista larga. Registrá la fuente y el estado de cada candidato.",
          "Publicar una oferta atrae jugadores que ya están interesados y disponibles. El aviso debe indicar club o tipo de institución, posición, categoría, ubicación, fechas, condiciones principales y proceso de selección. La transparencia mejora la calidad de las postulaciones.",
        ],
      },
      {
        heading: "Construí una evaluación comparable",
        subheading: "La evidencia reduce decisiones impulsivas",
        paragraphs: [
          "Usá una ficha común para todos los candidatos. Combiná video, datos, referencias y observación en vivo cuando sea posible. Las métricas deben responder al rol: no existe un único indicador válido para cualquier posición o competición.",
          "En la lista corta, verificá identidad, historial, disponibilidad y expectativas antes de avanzar. Si habrá una prueba, comunicá duración, responsables, cobertura médica, condiciones y pasos posteriores.",
        ],
        bullets: [
          "Adecuación táctica y técnica.",
          "Rendimiento físico y disponibilidad.",
          "Experiencia en contextos comparables.",
          "Comportamiento, referencias y comunicación.",
          "Costo, riesgo y potencial de desarrollo.",
        ],
      },
      {
        heading: "Cuidá la comunicación con cada candidato",
        subheading: "El proceso también representa al club",
        paragraphs: [
          "Confirmá la recepción de postulaciones, informá plazos realistas y cerrá el proceso cuando la vacante se cubra. Evitá solicitar documentación sensible en etapas iniciales y limitá el acceso a los datos personales.",
          "FutbolProyect permite consultar perfiles y publicar oportunidades para centralizar parte del proceso. La herramienta es más útil cuando el club llega con criterios claros, responsables definidos y una evaluación consistente.",
        ],
      },
    ],
  },
  {
    slug: "como-ser-analista-de-datos-en-futbol",
    title: "Cómo convertirse en analista de datos en fútbol",
    description:
      "Qué aprender, cómo practicar con datos reales y de qué manera construir un portfolio orientado al fútbol.",
    category: "Análisis de datos",
    date: "2026-06-05",
    image: "/images/jugador-estadio-futbol.png",
    imageAlt: "Jugador y estadio vinculados al análisis de datos en fútbol",
    author: "Equipo FutbolProyect",
    seoTitle: "Cómo ser analista de datos en fútbol: guía inicial",
    seoDescription:
      "Aprendé Excel, SQL, Power BI y Python, aplicalos al scouting y construí proyectos para trabajar como analista de datos en fútbol.",
    keywords: [
      "analista de datos fútbol",
      "trabajar en análisis de fútbol",
      "Power BI fútbol",
      "Python fútbol",
      "scouting y estadísticas",
    ],
    relatedSlugs: [
      "como-encontrar-jugadores-para-club",
      "como-conseguir-club-de-futbol",
    ],
    cta: {
      label: "Explorá oportunidades en FutbolProyect",
      href: "/ofertas/analistas-de-futbol",
      description:
        "Revisá búsquedas para analistas y otros profesionales del fútbol.",
    },
    content: [
      {
        heading: "Entendé primero el problema futbolístico",
        subheading: "La herramienta no reemplaza el criterio",
        paragraphs: [
          "Un analista aporta cuando convierte una pregunta deportiva en evidencia útil. Antes de calcular métricas, necesitás comprender reglas, posiciones, fases del juego, modelos tácticos y procesos de scouting. Hablar con entrenadores y observar partidos es parte del trabajo.",
          "Preguntas como qué lateral progresa mejor bajo presión o qué delantero encaja en un estilo directo requieren contexto. La respuesta depende de la competición, el rol, la calidad de los datos y las decisiones que se quieren apoyar.",
        ],
      },
      {
        heading: "Construí una base técnica progresiva",
        subheading: "Aprendé con proyectos, no solo con cursos",
        paragraphs: [
          "Excel o Google Sheets sirven para limpiar tablas, validar datos y explorar rápidamente. SQL permite consultar grandes conjuntos y combinar eventos, jugadores y partidos. Power BI u otra herramienta de visualización ayuda a crear reportes que un cuerpo técnico pueda interpretar.",
          "Python amplía las posibilidades de automatización, modelado y visualización. Empezá con pandas, gráficos y notebooks reproducibles antes de abordar modelos complejos. Git también es útil para versionar análisis y mostrar tu proceso.",
        ],
        bullets: [
          "Excel: fórmulas, tablas dinámicas y limpieza.",
          "SQL: filtros, agregaciones, joins y funciones de ventana.",
          "Power BI: modelo de datos, medidas y dashboards.",
          "Python: pandas, visualización y automatización.",
          "Estadística: distribuciones, muestras, incertidumbre y sesgos.",
        ],
      },
      {
        heading: "Aplicá las métricas al scouting y al rendimiento",
        subheading: "Compará jugadores en contextos equivalentes",
        paragraphs: [
          "Las métricas por 90 minutos, percentiles y mapas de acciones son puntos de partida, no conclusiones. Ajustá por minutos, posición, posesión y nivel de liga cuando corresponda. Documentá siempre de dónde provienen los datos y qué limitaciones tienen.",
          "En scouting, combiná datos con video. Una métrica puede señalar candidatos o patrones; el video ayuda a interpretar cómo y por qué ocurren. En rendimiento, coordiná con el cuerpo técnico para que cada reporte termine en una decisión o una nueva pregunta.",
        ],
      },
      {
        heading: "Creá un portfolio que demuestre tu forma de pensar",
        subheading: "Tres proyectos sólidos valen más que veinte gráficos aislados",
        paragraphs: [
          "Elegí preguntas específicas y publicá el recorrido completo: objetivo, fuente, limpieza, metodología, visualizaciones, hallazgos y limitaciones. Podés analizar perfiles para una posición, estilos de equipos o patrones de pelota parada con datos abiertos.",
          "Adaptá la presentación al destinatario. Un repositorio técnico puede acompañarse con un informe de una página y un dashboard simple. Compartí tus proyectos, solicitá devoluciones y revisá oportunidades para analistas en plataformas profesionales como FutbolProyect.",
        ],
        bullets: [
          "Usá fuentes permitidas y citá su licencia.",
          "Explicá supuestos y datos faltantes.",
          "Evitá rankings universales sin contexto.",
          "Mostrá código ordenado y resultados comprensibles.",
          "Cerrá con recomendaciones accionables.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
