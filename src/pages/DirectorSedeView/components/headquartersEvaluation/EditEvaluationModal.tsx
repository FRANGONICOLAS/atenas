import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
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
	const { t } = useLanguage();
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
				toast.error(t.evaluations.loadError, {
					description: "No se pudo cargar la evaluacion",
				});
			} finally {
				setLoading(false);
			}
		};

		void loadEvaluation();
	}, [open, evaluationId, t]);

	const handleClose = () => {
		if (!saving) {
			onClose();
		}
	};

	const handleSave = async () => {
		if (!evaluationId || !evaluationType) return;

		if (!detailPayload) {
			toast.error(t.evaluations.complete);
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
			toast.success(t.evaluations.updateSuccess, {
				description: beneficiaryName
					? t.evaluations.updatedFor.replace('{{name}}', beneficiaryName)
					: t.evaluations.updated,
			});
			onSaved();
			onClose();
		} catch (error) {
			console.error("Error updating evaluation:", error);
			toast.error(t.evaluations.updateError, {
				description: t.evaluations.updateErrorDesc,
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
				<DialogHeader>
					<DialogTitle>{t.evaluations.editTitle}</DialogTitle>
					<DialogDescription>
						{t.evaluations.editDesc}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div className="space-y-2">
						<Label>{t.evaluations.beneficiaryLabel}</Label>
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

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={saving}>
						{t.evaluations.actions.cancel}
					</Button>
					<Button onClick={handleSave} disabled={saving || !evaluationType || !detailPayload}>
						{saving ? t.evaluations.actions.saving : t.evaluations.actions.save}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
