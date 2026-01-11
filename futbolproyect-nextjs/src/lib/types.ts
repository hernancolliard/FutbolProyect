export interface Profile {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  nacionalidad: string;
  nacionalidad_en: string;
  posicion_principal: string;
  posicion_principal_en: string;
  altura_cm: number;
  peso_kg: number;
  pie_dominante: string;
  pie_dominante_en: string;
  resumen_profesional: string;
  resumen_profesional_en: string;
  foto_perfil_url: string;
  cv_url: string;
  linkedin_url: string;
  instagram_url: string;
  youtube_url: string;
  transfermarkt_url: string;
  tipo_usuario: 'jugador' | 'ofertante' | 'agencia';
  subscription_status: 'activa' | 'inactiva' | 'cancelada';
  subscription_plan: string;
  subscription_end_date: string;
  average_rating: number;
  total_ratings: number;
  fecha_de_nacimiento: string;
}

export interface Video {
  id: number;
  title: string;
  youtube_url: string;
  cover_image_url: string;
  position: number;
}

export interface UserPhoto {
    id: number;
    url: string;
    title: string;
    title_es: string;
    title_en: string;
}

export interface Application {
    id: number;
    oferta_id: number;
    oferta_titulo: string;
    estado: string;
    fecha_postulacion: string;
}
