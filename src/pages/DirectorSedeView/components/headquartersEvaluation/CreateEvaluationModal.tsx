import { useMemo, useState } from "react";
import { toast } from "sonner";
import { evaluationService } from "@/api/services";
import type { Json } from "@/api/types";
import { useSedeBeneficiaries } from "@/hooks/useSedeBeneficiaries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Ruler, Activity } from "lucide-react";
import { AntropometricForm } from "@/pages/DirectorView/components/Beneficiaries/AntropometricForm";
import { TechnicalTecticalForm } from "@/pages/DirectorView/components/Beneficiaries/TechnicalTecticalForm";
import { EmotionalForm } from "@/pages/DirectorView/components/Beneficiaries/EmotionalForm";
import { hasEvaluationDetail } from "@/lib/evaluationUtils";

interface CreateEvaluationModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const CreateEvaluationModal = ({
  open,
  onClose,
  onSaved,
}: CreateEvaluationModalProps) => {
  const { beneficiaries, loading } = useSedeBeneficiaries();
  const [beneficiaryId, setBeneficiaryId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "ANTHROPOMETRIC" | "TECHNICAL" | "EMOTIONAL"
  >("ANTHROPOMETRIC");
  const [anthropometricDetail, setAnthropometricDetail] = useState<
    Json | undefined
  >();
  const [technicalDetail, setTechnicalDetail] = useState<Json | undefined>();
  const [emotionalDetail, setEmotionalDetail] = useState<Json | undefined>();
  const [saving, setSaving] = useState(false);

  const beneficiaryOptions = useMemo(() => {
    return beneficiaries.map((beneficiary) => ({
      id: beneficiary.beneficiary_id,
      label: `${beneficiary.first_name} ${beneficiary.last_name}`,
    }));
  }, [beneficiaries]);

  const selectedBeneficiary = useMemo(
    () => beneficiaries.find((b) => b.beneficiary_id === beneficiaryId),
    [beneficiaries, beneficiaryId],
  );

  const resetForm = () => {
    setBeneficiaryId("");
    setAnthropometricDetail(undefined);
    setTechnicalDetail(undefined);
    setEmotionalDetail(undefined);
    setActiveTab("ANTHROPOMETRIC");
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const handleSave = async () => {
    if (!beneficiaryId) {
      toast.error("Debe seleccionar un jugador.");
      return;
    }

    const evaluationEntries = [
      {
        type: "ANTHROPOMETRIC" as const,
        detail: anthropometricDetail,
      },
      {
        type: "TECHNICAL" as const,
        detail: technicalDetail,
      },
      {
        type: "EMOTIONAL" as const,
        detail: emotionalDetail,
      },
    ].filter((entry) => hasEvaluationDetail(entry.detail));

    if (evaluationEntries.length === 0) {
      toast.error("Complete al menos una evaluación.");
      return;
    }

    try {
      setSaving(true);

      for (const entry of evaluationEntries) {
        await evaluationService.createForBeneficiary(beneficiaryId, {
          type: entry.type,
          ...(entry.type === "ANTHROPOMETRIC"
            ? { anthropometric_detail: entry.detail }
            : {}),
          ...(entry.type === "TECHNICAL"
            ? { technical_tactic_detail: entry.detail }
            : {}),
          ...(entry.type === "EMOTIONAL"
            ? { emotional_detail: entry.detail }
            : {}),
        });
      }

      toast.success("Evaluación creada con éxito.", {
        description: selectedBeneficiary
          ? `Evaluación guardada para ${selectedBeneficiary.first_name} ${selectedBeneficiary.last_name}`
          : "Evaluación guardada.",
      });
      onSaved();
      handleClose();
    } catch (error) {
      toast.error("Error al guardar la evaluación", {
        description: "No se pudo guardar la evaluación. Intente nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex h-full flex-col">
          <div className="px-6 py-6 space-y-6">
            <DialogHeader>
              <DialogTitle>Agregar evaluación</DialogTitle>
              <DialogDescription>
                Seleccione el jugador y complete las evaluaciones
                necesarias.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Jugador</Label>
                <Select
                  value={beneficiaryId}
                  onValueChange={(value) => setBeneficiaryId(value)}
                  disabled={loading || saving}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loading
                          ? "Cargando jugadores..."
                          : "Selecciona un jugador"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {beneficiaryOptions.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay jugadores disponibles
                      </SelectItem>
                    ) : (
                      beneficiaryOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {!beneficiaryId ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Seleccione un jugador para comenzar.
                </div>
              ) : (
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(
                      value as "ANTHROPOMETRIC" | "TECHNICAL" | "EMOTIONAL",
                    )
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="ANTHROPOMETRIC"
                      className="flex items-center gap-2"
                    >
                      <Ruler className="w-4 h-4" />
                      Antropométrica
                    </TabsTrigger>
                    <TabsTrigger
                      value="TECHNICAL"
                      className="flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4" />
                      Técnico-Táctica
                    </TabsTrigger>
                    <TabsTrigger
                      value="EMOTIONAL"
                      className="flex items-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      Emocional
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ANTHROPOMETRIC" className="py-4">
                    <AntropometricForm
                      data={anthropometricDetail}
                      onChange={(data) => setAnthropometricDetail(data)}
                    />
                  </TabsContent>

                  <TabsContent value="TECHNICAL" className="py-4">
                    <TechnicalTecticalForm
                      data={technicalDetail}
                      onChange={(data) => setTechnicalDetail(data)}
                    />
                  </TabsContent>

                  <TabsContent value="EMOTIONAL" className="py-4">
                    <EmotionalForm
                      data={emotionalDetail}
                      onChange={(data) => setEmotionalDetail(data)}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>

          <DialogFooter className="border-t bg-background px-6 py-4">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !beneficiaryId}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
