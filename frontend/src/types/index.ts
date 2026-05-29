export type Rol = 'admin' | 'gimnasio' | 'cliente' | 'editor';
export type NivelExperiencia = 'principiante' | 'intermedio' | 'avanzado';
export type SeveridadLesion = 'leve' | 'moderada' | 'grave';
export type EstadoPublicacion = 'borrador' | 'publicado' | 'archivado';
export type EstadoSuscripcion = 'activa' | 'pausada' | 'cancelada' | 'vencida';

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
  distancia_km?: number;
}

export interface Noticia {
  id: string;
  slug: string;
  titulo: string;
  subtitulo?: string;
  contenido?: string;
  resumen?: string;
  imagen_url?: string;
  imagen_alt?: string;
  categoria: string;
  autor: string;
  publicado: boolean;
  destacada: boolean;
  fecha_publicacion: string;
  views: number;
  tiempo_lectura?: number;
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

export interface Plan {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  activo: boolean;
}

export interface Suscripcion {
  id: string;
  usuario_id: string;
  gimnasio_id: string;
  plan_id: number;
  estado: EstadoSuscripcion;
  fecha_inicio: string;
  fecha_fin: string;
  precio_pagado: number;
  creado_en: string;
  plan_nombre?: string;
  plan_precio?: number;
  gimnasio_nombre?: string;
  gimnasio_slug?: string;
  gimnasio_imagen?: string;
  // miembros query fields
  nombre?: string;
  apellidos?: string;
  email?: string;
  usuario_id_field?: string;
}

export interface Pago {
  id: string;
  suscripcion_id: string;
  importe: number;
  estado: 'pagado' | 'pendiente' | 'fallido';
  fecha_pago: string;
  concepto?: string;
  plan_nombre?: string;
  gimnasio_nombre?: string;
}

export interface Clase {
  id: string;
  gimnasio_id: string;
  nombre: string;
  instructor?: string;
  arte_marcial?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  aforo_max: number;
  activa: boolean;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creado_en: string;
}
