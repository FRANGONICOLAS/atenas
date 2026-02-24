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
  const [activeTab, setActiveTab] = useState("anthropometric");
  const [anthropometricDetail, setAnthropometricDetail] = useState<
    AntropometricData | undefined
  >();
  const [technicalDetail, setTechnicalDetail] = useState<
    TechnicalTacticalData | undefined
  >();
  const [emotionalDetail, setEmotionalDetail] = useState<EmotionalData | undefined>();
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

    if (!anthropometricDetail && !technicalDetail && !emotionalDetail) {
      toast.error("Completa al menos una evaluacion");
      return;
    }

    try {
      setSaving(true);
      await evaluationService.createForBeneficiary(beneficiaryId, {
        anthropometric_detail: anthropometricDetail,
        technical_tactic_detail: technicalDetail,
        emotional_detail: emotionalDetail,
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="anthropometric" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Antropometrico
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Tecnico-Tactico
                </TabsTrigger>
                <TabsTrigger value="emotional" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Emocional
                </TabsTrigger>
              </TabsList>

              <TabsContent value="anthropometric" className="py-4">
                <BeneficiaryAntropometricForm
                  data={anthropometricDetail as Json | undefined}
                  onChange={(data) =>
                    setAnthropometricDetail(data as AntropometricData)
                  }
                />
              </TabsContent>

              <TabsContent value="technical" className="py-4">
                <TechnicalTecticalForm
                  data={technicalDetail as Json | undefined}
                  onChange={(data) =>
                    setTechnicalDetail(data as TechnicalTacticalData)
                  }
                />
              </TabsContent>

              <TabsContent value="emotional" className="py-4">
                <EmotionalForm
                  data={emotionalDetail as Json | undefined}
                  onChange={(data) => setEmotionalDetail(data as EmotionalData)}
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
