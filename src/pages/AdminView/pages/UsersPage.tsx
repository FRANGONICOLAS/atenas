import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsersView } from "../components";
import { UserDialog } from "../components";
import { ExportButton } from "../components";
import { useAdminDashboard } from "@/hooks/useAdminView";
import { User } from "@/types";

const UsersPage = () => {
  const {
    searchTerm,
    setSearchTerm,
    showUserDialog,
    setShowUserDialog,
    users,
    isLoadingUsers,
    editingUser,
    availableRoles,
    selectedRoles,
    setSelectedRoles,
    userForm,
    setUserForm,
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
    handleSaveUser,
    handleExportUsersExcel,
    handleExportUsersPDF,
    handleExportDonationsExcel,
    handleExportDonationsPDF,
    handleExportConsolidated,
  } = useAdminDashboard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Create User Button */}
          <Button onClick={handleCreateUser} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario
          </Button>

          {/* Export Button */}
          <ExportButton
            onExportUsersExcel={handleExportUsersExcel}
            onExportUsersPDF={handleExportUsersPDF}
            onExportDonationsExcel={handleExportDonationsExcel}
            onExportDonationsPDF={handleExportDonationsPDF}
            onExportConsolidated={handleExportConsolidated}
          />
        </div>
      </div>

      {/* Users Table */}
      <UsersView
        users={users}
        isLoadingUsers={isLoadingUsers}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* User Dialog */}
      <UserDialog
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        editingUser={editingUser as unknown as User}
        userForm={userForm}
        onUserFormChange={setUserForm}
        availableRoles={availableRoles}
        selectedRoles={selectedRoles}
        onSelectedRolesChange={setSelectedRoles}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UsersPage;
