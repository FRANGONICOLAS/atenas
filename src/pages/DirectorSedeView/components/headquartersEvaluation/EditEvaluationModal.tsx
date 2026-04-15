import { useEffect, useState } from "react";
import { toast } from "sonner";
import { evaluationService } from "@/api/services";
import type { Json } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BeneficiaryAntropometricForm } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryAntropometricForm";
import { TechnicalTecticalForm } from "@/pages/DirectorView/components/Beneficiaries/TechnicalTecticalForm";
import { EmotionalForm } from "@/pages/DirectorView/components/Beneficiaries/EmotionalForm";
import {
  evaluationTypeLabels,
  getEvaluationDetailByType,
  normalizeEvaluationType,
} from "@/lib/evaluationUtils";

interface EditEvaluationModalProps {
  open: boolean;
  evaluationId: string | null;
  beneficiaryName: string;
  onClose: () => void;
  onSaved: () => void;
}

export const EditEvaluationModal = ({
  open,
  evaluationId,
  beneficiaryName,
  onClose,
  onSaved,
}: EditEvaluationModalProps) => {
  const [evaluationType, setEvaluationType] = useState<
    "ANTHROPOMETRIC" | "TECHNICAL" | "EMOTIONAL" | null
  >(null);
  const [detailPayload, setDetailPayload] = useState<Json | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadEvaluation = async () => {
      if (!open || !evaluationId) return;

      try {
        setLoading(true);
        const data = await evaluationService.getById(evaluationId);
        setEvaluationType(normalizeEvaluationType(data.type));
        setDetailPayload(getEvaluationDetailByType(data) ?? undefined);
      } catch (error) {
        console.error("Error loading evaluation:", error);
        toast.error("Error al cargar la evaluación", {
          description: "No se pudo cargar la evaluación",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadEvaluation();
  }, [open, evaluationId]);

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!evaluationId || !evaluationType) return;

    if (!detailPayload) {
      toast.error("Complete los datos de la evaluación.");
      return;
    }

    try {
      setSaving(true);
      await evaluationService.updateEvaluation(evaluationId, {
        type: evaluationType,
        ...(evaluationType === "ANTHROPOMETRIC"
          ? { anthropometric_detail: detailPayload }
          : {}),
        ...(evaluationType === "TECHNICAL"
          ? { technical_tactic_detail: detailPayload }
          : {}),
        ...(evaluationType === "EMOTIONAL"
          ? { emotional_detail: detailPayload }
          : {}),
      });
      toast.success("Evaluación actualizada correctamente.", {
        description: beneficiaryName
          ? `Evaluación actualizada para ${beneficiaryName}`
          : "Evaluación actualizada",
      });
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error updating evaluation:", error);
      toast.error("Error al actualizar la evaluación", {
        description: "No se pudo actualizar la evaluación. Intente nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderForm = () => {
    if (loading) {
      return (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Cargando evaluacion...
        </div>
      );
    }

    switch (evaluationType) {
      case "ANTHROPOMETRIC":
        return (
          <BeneficiaryAntropometricForm
            data={detailPayload}
            onChange={(data) => setDetailPayload(data)}
          />
        );
      case "TECHNICAL":
        return (
          <TechnicalTecticalForm
            data={detailPayload}
            onChange={(data) => setDetailPayload(data)}
          />
        );
      case "EMOTIONAL":
        return (
          <EmotionalForm
            data={detailPayload}
            onChange={(data) => setDetailPayload(data)}
          />
        );
      default:
        return (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No hay un formulario disponible para este tipo de evaluación.
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex h-full flex-col">
          <div className="px-6 py-6 space-y-6">
            <DialogHeader>
              <DialogTitle>Editar evaluación</DialogTitle>
              <DialogDescription>
                Modifique los datos de la evaluación
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Beneficiario</Label>
                <Input value={beneficiaryName || "Beneficiario"} disabled />
              </div>

              <div className="space-y-2">
                <Label>Tipo de evaluación</Label>
                {evaluationType ? (
                  <Badge variant="secondary" className="w-fit">
                    {evaluationTypeLabels[evaluationType]}
                  </Badge>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No se pudo identificar el tipo de evaluación.
                  </div>
                )}
              </div>

              {renderForm()}
            </div>
          </div>

          <DialogFooter className="border-t bg-background px-6 py-4">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !evaluationType || !detailPayload}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
