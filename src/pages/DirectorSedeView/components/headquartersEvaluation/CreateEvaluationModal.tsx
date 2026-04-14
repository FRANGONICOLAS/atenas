import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
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
import { BeneficiaryAntropometricForm } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryAntropometricForm";
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
  const { t } = useLanguage();
  const { beneficiaries, loading } = useSedeBeneficiaries();
  const [beneficiaryId, setBeneficiaryId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "ANTHROPOMETRIC" | "TECHNICAL" | "EMOTIONAL"
  >("ANTHROPOMETRIC");
  const [anthropometricDetail, setAnthropometricDetail] = useState<Json | undefined>();
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
      toast.error(t.evaluations.selectBeneficiary);
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
      toast.error(t.evaluations.complete);
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
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "ANTHROPOMETRIC" | "TECHNICAL" | "EMOTIONAL")} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ANTHROPOMETRIC" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  {t.evaluations.tabs.anthropometric}
                </TabsTrigger>
                <TabsTrigger value="TECHNICAL" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {t.evaluations.tabs.technical}
                </TabsTrigger>
                <TabsTrigger value="EMOTIONAL" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {t.evaluations.tabs.emotional}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ANTHROPOMETRIC" className="py-4">
                <BeneficiaryAntropometricForm
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

        <DialogFooter className="sticky bottom-0 -mx-6 px-6 py-4 border-t bg-background">
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
