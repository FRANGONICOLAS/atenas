// Estados de testimonios
export type TestimonialStatus = "pending" | "approved" | "rejected";

// Interfaz principal de testimonio basada en la estructura de la base de datos
export interface Testimonial {
  testimonial_id: string;
  beneficiary_id: string;
  user_id: string;
  title: string;
  content: string;
  rating: number; // 1-5 estrellas
  status: TestimonialStatus | string;
  date: string;
  approve?: boolean;
}

// Datos para crear un testimonio
export interface CreateTestimonialData {
  beneficiary_id: string;
  user_id: string;
  title: string;
  content: string;
  rating: number; // 1-5 estrellas
  status?: TestimonialStatus | string;
  date?: string;
}

// Datos para actualizar un testimonio
export interface UpdateTestimonialData {
  title?: string;
  content?: string;
  rating?: number;
  status?: TestimonialStatus | string;
  approve?: boolean;
}

// Interfaz extendida con información de usuario y beneficiario
export interface TestimonialWithDetails extends Testimonial {
  user_name?: string;
  user_image?: string;
  beneficiary_name?: string;
}
