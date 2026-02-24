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
	const [activeTab, setActiveTab] = useState<
	"anthropometric" | "technical_tactic" | "psychological_emotional"
>("anthropometric");
	const [detailPayload, setDetailPayload] = useState<Record<string, unknown> | undefined>();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const loadEvaluation = async () => {
			if (!open || !evaluationId) return;

			try {
				setLoading(true);
				const data = await evaluationService.getById(evaluationId);
					setDetailPayload(
						(data.questions_answers as Record<string, unknown> | null) || undefined,
					);
					switch (data.type) {
						case 'anthropometric':
							setActiveTab('anthropometric');
							break;
						case 'technical_tactic':
							setActiveTab('technical_tactic');
							break;
						case 'psychological_emotional':
							setActiveTab('psychological_emotional');
							break;
						default:
							setActiveTab('anthropometric');
					}
				setLoading(false);
			}
				catch (error) {
				console.error("Error loading evaluation:", error);
				toast.error("Error al cargar evaluacion", {
					description: "No se pudo cargar la evaluacion",
				});
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

		if (!detailPayload) {
			toast.error("Completa la evaluacion");
			return;
		}

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
			await evaluationService.updateEvaluation(evaluationId, {
				type: typeKey,
				questions_answers: detailPayload as Json,
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
										setDetailPayload(data as AntropometricData)
									}
								/>
							</TabsContent>

							<TabsContent value="technical_tactic" className="py-4">
								<TechnicalTecticalForm
									data={detailPayload as Json | undefined}
									onChange={(data) =>
										setDetailPayload(data as TechnicalTacticalData)
									}
								/>
							</TabsContent>

							<TabsContent value="psychological_emotional" className="py-4">
								<EmotionalForm
									data={detailPayload as Json | undefined}
									onChange={(data) => setDetailPayload(data as EmotionalData)}
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
