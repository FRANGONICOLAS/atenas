import { DollarSign } from 'lucide-react';
import { DonationsHistory } from '../components/DonationsHistory';

const DonationsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Mis Donaciones</h2>
        </div>
      </div>

      <DonationsHistory />
    </div>
  );
};

export default DonationsPage;
