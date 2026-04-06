export type Rol = 'admin' | 'gimnasio' | 'cliente' | 'editor';
export type NivelExperiencia = 'principiante' | 'intermedio' | 'avanzado';
export type SeveridadLesion = 'leve' | 'moderada' | 'grave';
export type EstadoPublicacion = 'borrador' | 'publicado' | 'archivado';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellidos?: string;
  rol: Rol;
  avatar_url?: string;
  lesiones?: Lesion[];
}

export interface ArteMarcial {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen_url?: string;
  impacto_fisico?: string;
  compatibilidades?: CompatibilidadDetalle[];
}

export interface Lesion {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  zona_corporal?: string;
  severidad: SeveridadLesion;
  artes_marciales?: CompatibilidadDetalle[];
}

export interface CompatibilidadDetalle {
  arte?: string;
  arte_slug?: string;
  lesion?: string;
  zona?: string;
  compatible: boolean;
  nivel?: NivelExperiencia;
  notas?: string;
}

export interface Gimnasio {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
  pais?: string;
  imagen_url?: string;
  imagenes?: string[];
  precio_desde?: number;
  verificado: boolean;
  activo?: boolean;
  artes?: string[];
  latitud?: number;
  longitud?: number;
  telefono?: string;
  email_contacto?: string;
  sitio_web?: string;
  horario?: Record<string, string>;
}

export interface Post {
  id: string;
  titulo: string;
  slug: string;
  resumen?: string;
  contenido?: string;
  imagen_portada?: string;
  estado: EstadoPublicacion;
  publicado_en?: string;
  autor_nombre?: string;
  autor_avatar?: string;
  etiquetas?: string[];
}
