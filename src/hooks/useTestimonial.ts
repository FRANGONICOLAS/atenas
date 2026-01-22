import { useState, useEffect } from "react";
import { toast } from "sonner";
import { testimonialService } from "@/api/services/testimonial.services";
import type {
  Testimonial,
  CreateTestimonialData,
  UpdateTestimonialData,
} from "@/types/testimonial.types";

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar todos los testimonios
  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialService.getAll();
      setTestimonials(data);
    } catch (error) {
      console.error("Error loading testimonials:", error);
      toast.error("Error al cargar testimonios");
    } finally {
      setLoading(false);
    }
  };

  // Cargar solo testimonios aprobados (para vista pública)
  const loadApprovedTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialService.getApproved();
      setTestimonials(data);
    } catch (error) {
      console.error("Error loading approved testimonials:", error);
      toast.error("Error al cargar testimonios");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadApprovedTestimonials();
  }, []);

  // Handler para crear testimonio
  const handleCreate = async (testimonialData: CreateTestimonialData) => {
    try {
      await testimonialService.create(testimonialData);
      toast.success("Testimonio enviado", {
        description: "Tu testimonio será revisado por nuestro equipo",
      });
      await loadApprovedTestimonials();
      return true;
    } catch (error) {
      console.error("Error creating testimonial:", error);
      toast.error("Error al enviar testimonio", {
        description: "No se pudo crear el testimonio",
      });
      return false;
    }
  };

  // Handler para actualizar testimonio
  const handleUpdate = async (
    testimonialId: string,
    testimonialData: UpdateTestimonialData
  ) => {
    try {
      await testimonialService.update(testimonialId, testimonialData);
      toast.success("Testimonio actualizado correctamente");
      await loadApprovedTestimonials();
      return true;
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Error al actualizar", {
        description: "No se pudo actualizar el testimonio",
      });
      return false;
    }
  };

  // Handler para eliminar testimonio
  const handleDelete = async (testimonialId: string) => {
    try {
      await testimonialService.delete(testimonialId);
      await loadApprovedTestimonials();
      toast.success("Testimonio eliminado correctamente");
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el testimonio",
      });
      throw error;
    }
  };

  // Handler para aprobar testimonio
  const handleApprove = async (testimonialId: string) => {
    try {
      await testimonialService.approve(testimonialId);
      toast.success("Testimonio aprobado");
      await loadTestimonials();
    } catch (error) {
      console.error("Error approving testimonial:", error);
      toast.error("Error al aprobar testimonio");
      throw error;
    }
  };

  // Handler para rechazar testimonio
  const handleReject = async (testimonialId: string) => {
    try {
      await testimonialService.reject(testimonialId);
      toast.success("Testimonio rechazado");
      await loadTestimonials();
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      toast.error("Error al rechazar testimonio");
      throw error;
    }
  };

  return {
    testimonials,
    loading,
    loadTestimonials,
    loadApprovedTestimonials,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleApprove,
    handleReject,
  };
};
