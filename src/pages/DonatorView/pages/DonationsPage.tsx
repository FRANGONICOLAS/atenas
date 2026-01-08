import { DollarSign } from 'lucide-react';
import { useDonatorView } from '@/hooks/useDonatorView';

const DonationsPage = () => {
  const { donations, donorName, stats } = useDonatorView();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Mis Donaciones</h2>
        </div>
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Vista de donaciones en desarrollo</p>
      </div>
    </div>
  );
};

export default DonationsPage;
