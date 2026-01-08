import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 lg:p-6 lg:pl-8">
          {children}
        </div>
      </main>
    </div>
  );
};
