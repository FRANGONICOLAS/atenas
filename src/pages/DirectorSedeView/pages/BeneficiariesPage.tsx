import { Users } from 'lucide-react';
import { useDirectorSedeView } from '@/hooks/useDirectorSedeView';

const BeneficiariesPage = () => {
  const { beneficiaries, sedeName } = useDirectorSedeView();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Beneficiarios de la Sede</h2>
        </div>
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Vista de beneficiarios en desarrollo</p>
      </div>
    </div>
  );
};

export default BeneficiariesPage;
