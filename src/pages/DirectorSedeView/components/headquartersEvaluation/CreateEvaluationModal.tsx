import { useMemo, useState } from "react";
import { toast } from "sonner";
import { evaluationService } from "@/api/services";
import type {
  AntropometricData,
  EmotionalData,
  TechnicalTacticalData,
} from "@/types/beneficiary.types";
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
import { BeneficiaryAntropometricForm } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryAntropometricForm";
import { TechnicalTecticalForm } from "@/pages/DirectorView/components/Beneficiaries/TechnicalTecticalForm";
import { EmotionalForm } from "@/pages/DirectorView/components/Beneficiaries/EmotionalForm";

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
    "anthropometric" | "technical_tactic" | "psychological_emotional"
  >("anthropometric");
  const [detailPayload, setDetailPayload] = useState<Record<string, unknown> | undefined>();
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
    setDetailPayload(undefined);
    setActiveTab("anthropometric");
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const handleSave = async () => {
    if (!beneficiaryId) {
      toast.error("Selecciona un beneficiario");
      return;
    }

    if (!detailPayload) {
      toast.error("Completa la evaluacion");
      return;
    }

    // determine evaluation type mapping
    let typeKey: 'anthropometric' | 'technical_tactic' | 'psychological_emotional';
    switch (activeTab) {
      case 'anthropometric':
        typeKey = 'anthropometric';
        break;
      case 'technical_tactic':
        typeKey = 'technical_tactic';
        break;
      case 'psychological_emotional':
        typeKey = 'psychological_emotional';
        break;
      default:
        typeKey = 'anthropometric';
    }

    try {
      setSaving(true);
      await evaluationService.createForBeneficiary(beneficiaryId, {
        type: typeKey,
        questions_answers: detailPayload as Json,
      });
      toast.success("Evaluacion registrada", {
        description: selectedBeneficiary
          ? `Evaluacion guardada para ${selectedBeneficiary.first_name} ${selectedBeneficiary.last_name}`
          : "Evaluacion guardada",
      });
      onSaved();
      handleClose();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error("Error al guardar evaluacion", {
        description: "No se pudo registrar la evaluacion",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar evaluacion</DialogTitle>
          <DialogDescription>
            Selecciona el beneficiario y completa las evaluaciones necesarias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Beneficiario</Label>
            <Select
              value={beneficiaryId}
              onValueChange={(value) => setBeneficiaryId(value)}
              disabled={loading || saving}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loading ? "Cargando beneficiarios..." : "Selecciona beneficiario"}
                />
              </SelectTrigger>
              <SelectContent>
                {beneficiaryOptions.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Sin beneficiarios disponibles
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
              Selecciona un beneficiario para habilitar los formularios de evaluacion.
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "anthropometric" | "technical_tactic" | "psychological_emotional")} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="anthropometric" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Antropometrico
                </TabsTrigger>
                <TabsTrigger value="technical_tactic" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Tecnico-Tactico
                </TabsTrigger>
                <TabsTrigger value="psychological_emotional" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Emocional
                </TabsTrigger>
              </TabsList>

              <TabsContent value="anthropometric" className="py-4">
                <BeneficiaryAntropometricForm
                  data={detailPayload as Json | undefined}
                  onChange={(data) =>
                    setDetailPayload(data as Record<string, unknown>)
                  }
                />
              </TabsContent>

              <TabsContent value="technical_tactic" className="py-4">
                <TechnicalTecticalForm
                  data={detailPayload as Json | undefined}
                  onChange={(data) =>
                    setDetailPayload(data as Record<string, unknown>)
                  }
                />
              </TabsContent>

              <TabsContent value="psychological_emotional" className="py-4">
                <EmotionalForm
                  data={detailPayload as Json | undefined}
                  onChange={(data) =>
                    setDetailPayload(data as Record<string, unknown>)
                  }
                />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !beneficiaryId}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
