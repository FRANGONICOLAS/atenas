import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CreateTestimonialData } from "@/types/testimonial.types";

interface CreateTestimonialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTestimonialData) => Promise<boolean>;
  userId: string;
  beneficiaryId: string;
}

export const CreateTestimonialModal = ({
  open,
  onOpenChange,
  onSubmit,
  userId,
  beneficiaryId,
}: CreateTestimonialModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);

    const testimonialData: CreateTestimonialData = {
      beneficiary_id: beneficiaryId,
      user_id: userId,
      title: title.trim(),
      content: content.trim(),
      rating,
    };

    const success = await onSubmit(testimonialData);

    setIsSubmitting(false);

    if (success) {
      // Limpiar formulario
      setTitle("");
      setContent("");
      setRating(5);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setRating(5);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Testimonio</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con la fundación. Tu testimonio será revisado antes de publicarse.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Un título para tu testimonio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              placeholder="Cuéntanos tu experiencia..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </p>
          </div>

          {/* Calificación */}
          <div className="space-y-2">
            <Label>Calificación</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-secondary text-secondary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating} {rating === 1 ? "estrella" : "estrellas"}
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Testimonio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
