import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
      toast.error(t.evaluations.selectBeneficiary);
      return;
    }

    if (!detailPayload) {
      toast.error(t.evaluations.complete);
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
      toast.success(t.evaluations.createSuccess, {
        description: selectedBeneficiary
          ? t.evaluations.savedFor.replace('{{name}}', `${selectedBeneficiary.first_name} ${selectedBeneficiary.last_name}`)
          : t.evaluations.saved,
      });
      onSaved();
      handleClose();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error(t.evaluations.createError, {
        description: t.evaluations.createErrorDesc,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.evaluations.addTitle}</DialogTitle>
          <DialogDescription>
            {t.evaluations.addDesc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>{t.evaluations.beneficiaryLabel}</Label>
            <Select
              value={beneficiaryId}
              onValueChange={(value) => setBeneficiaryId(value)}
              disabled={loading || saving}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loading ? t.evaluations.loadingBeneficiaries : t.evaluations.selectPlaceholder}
                />
              </SelectTrigger>
              <SelectContent>
                {beneficiaryOptions.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    {t.evaluations.noBeneficiaries}
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
              {t.evaluations.selectPrompt}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "anthropometric" | "technical_tactic" | "psychological_emotional")} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="anthropometric" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  {t.evaluations.tabs.anthropometric}
                </TabsTrigger>
                <TabsTrigger value="technical_tactic" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {t.evaluations.tabs.technical}
                </TabsTrigger>
                <TabsTrigger value="psychological_emotional" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {t.evaluations.tabs.emotional}
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
            {t.evaluations.actions.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving || !beneficiaryId}>
            {saving ? t.evaluations.actions.saving : t.evaluations.actions.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
