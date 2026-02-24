import { useEffect, useState } from "react";
import { toast } from "sonner";
import { evaluationService } from "@/api/services";
import type {
	AntropometricData,
	EmotionalData,
	TechnicalTacticalData,
} from "@/types/beneficiary.types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Ruler, Activity } from "lucide-react";
import { BeneficiaryAntropometricForm } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryAntropometricForm";
import { TechnicalTecticalForm } from "@/pages/DirectorView/components/Beneficiaries/TechnicalTecticalForm";
import { EmotionalForm } from "@/pages/DirectorView/components/Beneficiaries/EmotionalForm";

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
	const [activeTab, setActiveTab] = useState("anthropometric");
	const [anthropometricDetail, setAnthropometricDetail] = useState<
		AntropometricData | undefined
	>();
	const [technicalDetail, setTechnicalDetail] = useState<
		TechnicalTacticalData | undefined
	>();
	const [emotionalDetail, setEmotionalDetail] = useState<EmotionalData | undefined>();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const loadEvaluation = async () => {
			if (!open || !evaluationId) return;

			try {
				setLoading(true);
				const data = await evaluationService.getById(evaluationId);
				setAnthropometricDetail(
					(data.anthropometric_detail as AntropometricData | null) || undefined,
				);
				setTechnicalDetail(
					(data.technical_tactic_detail as TechnicalTacticalData | null) || undefined,
				);
				setEmotionalDetail(
					(data.emotional_detail as EmotionalData | null) || undefined,
				);
				setActiveTab("anthropometric");
			} catch (error) {
				console.error("Error loading evaluation:", error);
				toast.error("Error al cargar evaluacion", {
					description: "No se pudo obtener la informacion de la evaluacion",
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
		if (!evaluationId) return;

		if (!anthropometricDetail && !technicalDetail && !emotionalDetail) {
			toast.error("Completa al menos una evaluacion");
			return;
		}

		try {
			setSaving(true);
			await evaluationService.updateEvaluation(evaluationId, {
				anthropometric_detail: anthropometricDetail ?? null,
				technical_tactic_detail: technicalDetail ?? null,
				emotional_detail: emotionalDetail ?? null,
			});
			toast.success("Evaluacion actualizada", {
				description: beneficiaryName
					? `Evaluacion actualizada para ${beneficiaryName}`
					: "Evaluacion actualizada",
			});
			onSaved();
			onClose();
		} catch (error) {
			console.error("Error updating evaluation:", error);
			toast.error("Error al actualizar evaluacion", {
				description: "No se pudo actualizar la evaluacion",
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Editar evaluacion</DialogTitle>
					<DialogDescription>
						Actualiza los formularios de evaluacion del beneficiario.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div className="space-y-2">
						<Label>Beneficiario</Label>
						<Input value={beneficiaryName || "Beneficiario"} disabled />
					</div>

					{loading ? (
						<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
							Cargando evaluacion...
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
					<Button onClick={handleSave} disabled={saving || loading || !evaluationId}>
						{saving ? "Guardando..." : "Actualizar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
