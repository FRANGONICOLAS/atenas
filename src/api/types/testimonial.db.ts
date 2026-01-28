/**
 * Testimonial table types
 */

export interface TestimonialRow {
  approve: boolean | null
  beneficiary_id: string | null
  content: string
  date: string | null
  rating: number | null
  status: string
  testimonial_id: string
  title: string
  user_id: string
}

export interface TestimonialInsert {
  approve?: boolean | null
  beneficiary_id?: string | null
  content: string
  date?: string | null
  rating?: number | null
  status?: string
  testimonial_id?: string
  title: string
  user_id: string
}

export interface TestimonialUpdate {
  approve?: boolean | null
  beneficiary_id?: string | null
  content?: string
  date?: string | null
  rating?: number | null
  status?: string
  testimonial_id?: string
  title?: string
  user_id?: string
}
