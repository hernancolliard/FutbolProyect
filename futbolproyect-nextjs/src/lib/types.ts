export interface Profile {
  id: string;
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
  idiomas?: string;
  estadisticas?: string;
  trayectoria?: string;
  disponibilidad?: string;
  foto_perfil_url: string;
  cv_url: string;
  linkedin_url: string;
  instagram_url: string;
  youtube_url: string;
  transfermarkt_url: string;
  whatsapp_url?: string;
  agente_nombre?: string;
  agente_contacto?: string;
  tipo_usuario: 'postulante' | 'jugador' | 'ofertante' | 'agencia';
  rol?: string;
  managed_profile_id?: number;
  owner_user_id?: number;
  is_managed_profile?: boolean;
  subscription_status: 'activa' | 'inactiva' | 'cancelada';
  subscription_plan: string;
  subscription_end_date: string;
  average_rating: number;
  total_ratings: number;
  profile_views?: number;
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

export interface ScoutingReportImage {
  id: number;
  report_id: number;
  url: string;
  position: number;
}

export interface ScoutingReport {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  images: ScoutingReportImage[];
}

export interface Application {
    id: number;
    oferta_id: number;
    oferta_titulo: string;
    estado: string;
    fecha_postulacion: string;
}

export interface Offer {
  id: string;
  is_featured: boolean;
  imagen_url?: string;
  titulo_es?: string;
  titulo_en?: string;
  titulo: string;
  descripcion_es?: string;
  descripcion_en?: string;
  descripcion: string;
  ubicacion_es?: string;
  ubicacion_en?: string;
  ubicacion: string;
  puesto_es?: string;
  puesto_en?: string;
  puesto: string;
  nivel?: string;
  nivel_es?: string;
  nivel_en?: string;
  salario?: string | number;
  horarios?: string;
  horarios_es?: string;
  horarios_en?: string;
  detalles_adicionales?: string;
  detalles_adicionales_es?: string;
  detalles_adicionales_en?: string;
  fecha_publicacion?: string;
  nombre_ofertante: string;
  id_usuario_ofertante: string;
  applicants?: { user_id: string }[];
}

export interface Advertisement {
  id: number;
  title: string;
  advertiser_name: string;
  advertiser_type: string;
  image_url: string;
  target_url?: string;
  placement: string;
  language: string;
  country?: string;
  description?: string;
  button_text?: string;
  package_type?: string;
  notes?: string;
  priority: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  impressions_count?: number;
  clicks_count?: number;
  ctr?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdvertisingLead {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  website?: string;
  advertiser_type?: string;
  budget?: string;
  message: string;
  status: string;
  created_at: string;
  updated_at?: string;
}
