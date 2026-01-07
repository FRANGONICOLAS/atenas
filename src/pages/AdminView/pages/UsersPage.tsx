import { UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UsersView } from '../components/UsersView';
import { UserDialog } from '../components/UserDialog';
import { useAdminDashboard } from '@/hooks/useAdminView';

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
  } = useAdminDashboard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        </div>
        <Button 
          onClick={handleCreateUser}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
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
        editingUser={editingUser}
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
