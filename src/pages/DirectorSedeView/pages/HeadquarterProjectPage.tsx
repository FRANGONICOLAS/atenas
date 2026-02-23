import { useState } from "react";
import { useSedeProjects } from "@/hooks/useSedeProjects";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { ProjectStats } from "@/pages/DirectorView/components/Projects/ProjectStats";
import { ProjectFilters } from "@/pages/DirectorView/components/Projects/ProjectFilters";
import { ProjectsTable } from "@/pages/DirectorView/components/Projects/ProjectsTable";
import { ProjectDetailDialog } from "@/pages/DirectorView/components/Projects/ProjectDetailDialog";
import { HeadquarterProjectDialog } from "@/pages/DirectorSedeView/components/headquartersProject/HeadquarterProjectDialog";
import { toast } from "sonner";
import { Target, Plus, Download } from "lucide-react";
import {
	generateProjectsExcel,
	generateProjectsPDF,
} from "@/lib/reportGenerator";
import type { Project, ProjectReport } from "@/types";

const HeadquarterProjectPage = () => {
	const {
		filtered,
		loading,
		search,
		setSearch,
		categoryFilter,
		setCategoryFilter,
		priorityFilter,
		setPriorityFilter,
		typeFilter,
		setTypeFilter,
		stats,
		formatCurrency,
		handleSaveProject,
		handleDeleteProject,
		assignedHeadquarterName,
	} = useSedeProjects();

	const [showDialog, setShowDialog] = useState(false);
	const [editing, setEditing] = useState<Project | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [detailProject, setDetailProject] = useState<Project | null>(null);

	const getHqName = () => assignedHeadquarterName || "Sin sede";

	const openCreate = () => {
		setEditing(null);
		setShowDialog(true);
	};

	const openEdit = (project: Project) => {
		setEditing(project);
		setShowDialog(true);
	};

	const handleSave = async (data: {
		name: string;
		category: string;
		type: "investment" | "free";
		goal: number;
		priority: "high" | "medium" | "low";
		deadline: string;
		description: string;
	}) => {
		if (!data.name || !data.category || !data.deadline) {
			toast.error("Campos requeridos", {
				description: "Por favor completa nombre, categoria y fecha limite",
			});
			return;
		}

		const projectData = {
			name: data.name,
			category: data.category,
			type: data.type,
			description: data.description,
			finance_goal: data.goal,
			start_date: data.deadline,
			end_date: data.deadline,
			status: "active" as const,
		};

		const success = await handleSaveProject(
			projectData,
			!!editing,
			editing?.project_id,
		);

		if (success) {
			setShowDialog(false);
			setEditing(null);
		}
	};

	const initiateDelete = (project: Project) => {
		setDeleteTarget(project);
		setShowDeleteConfirm(true);
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;

		try {
			if (deleteTarget.project_id) {
				await handleDeleteProject(deleteTarget.project_id, deleteTarget.name);
			}
			setShowDeleteConfirm(false);
			setDeleteTarget(null);
		} catch (error) {
			// Error ya manejado en el hook
		}
	};

	const mapProjectsToReport = (items: Project[]): ProjectReport[] =>
		items.map((p) => ({
			id: p.id,
			name: p.name,
			category: p.category,
			goal: p.goal,
			raised: p.raised,
			progress: p.progress,
			status: p.progress >= 100 ? "Completado" : "En curso",
		}));

	const handleExportExcel = () => {
		const data = mapProjectsToReport(filtered);
		generateProjectsExcel(data, "proyectos-sede");
		toast.success("Reporte Excel generado", {
			description: `Se exportaron ${data.length} proyectos`,
		});
	};

	const handleExportPDF = () => {
		const data = mapProjectsToReport(filtered);
		generateProjectsPDF(data, "proyectos-sede");
		toast.success("Reporte PDF generado", {
			description: `Se exportaron ${data.length} proyectos`,
		});
	};

	if (loading) {
		return <FullScreenLoader message="Cargando proyectos de la sede..." />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Target className="h-6 w-6 text-blue-600" />
					<h2 className="text-2xl font-bold text-gray-900">Proyectos</h2>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={handleExportExcel}>
						<Download className="h-4 w-4 mr-2" />
						Excel
					</Button>
					<Button variant="outline" size="sm" onClick={handleExportPDF}>
						<Download className="h-4 w-4 mr-2" />
						PDF
					</Button>
					<Button onClick={openCreate}>
						<Plus className="h-4 w-4 mr-2" />
						Nuevo Proyecto
					</Button>
				</div>
			</div>

			{/* Stats */}
			<ProjectStats stats={stats} />

			{/* Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="w-5 h-5" />
						Proyectos de la sede
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<ProjectFilters
							search={search}
							onSearchChange={setSearch}
							categoryFilter={categoryFilter}
							onCategoryFilterChange={setCategoryFilter}
							priorityFilter={priorityFilter}
							onPriorityFilterChange={setPriorityFilter}
							typeFilter={typeFilter}
							onTypeFilterChange={setTypeFilter}
						/>

						<ProjectsTable
							projects={filtered}
							onEdit={openEdit}
							onDelete={initiateDelete}
							onView={setDetailProject}
							formatCurrency={formatCurrency}
							getHqName={getHqName}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Create/Edit Dialog */}
			<HeadquarterProjectDialog
				open={showDialog}
				onClose={() => {
					setShowDialog(false);
					setEditing(null);
				}}
				project={editing}
				onSave={handleSave}
			/>

			{/* Detail Dialog */}
			<ProjectDetailDialog
				project={detailProject}
				open={!!detailProject}
				onClose={() => setDetailProject(null)}
				formatCurrency={formatCurrency}
				getHqName={getHqName}
			/>

			{/* Delete Confirmation */}
			<DeleteConfirmation
				open={showDeleteConfirm}
				onConfirm={handleDelete}
				onCancel={() => {
					setShowDeleteConfirm(false);
					setDeleteTarget(null);
				}}
				title="¿Eliminar proyecto?"
				description={
					deleteTarget
						? `Estas a punto de eliminar "${deleteTarget.name}". Esta accion no se puede deshacer.`
						: "Esta accion no se puede deshacer."
				}
			/>
		</div>
	);
};

export default HeadquarterProjectPage;
