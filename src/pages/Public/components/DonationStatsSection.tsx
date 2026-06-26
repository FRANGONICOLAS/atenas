import { DollarSign, Heart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface DonationStat {
  totalDonations: number;
  totalRaised: number;
  recentDonations: Array<{
    donation_id: string;
    amount: string;
    currency: string;
    date: string;
    project_name: string | null;
  }>;
}

interface DonationStatsSectionProps {
  stats: DonationStat | null;
}

export const DonationStatsSection = ({ stats }: DonationStatsSectionProps) => {
  const { t } = useLanguage();

  const formatCurrency = (amount: string, currency?: string) => {
    const cur = currency || 'COP';
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(parseFloat(amount));
    } catch {
      return `${cur} ${amount}`;
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.home.impactTitle}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gracias a tus donaciones, seguimos transformando vidas a través del deporte
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="text-center p-6 rounded-xl bg-muted/30">
            <DollarSign className="w-10 h-10 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">{stats ? formatCurrency(String(stats.totalRaised)) : '$0'}</div>
            <div className="text-sm text-muted-foreground">Total Recaudado</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-muted/30">
            <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">{stats ? stats.totalDonations : '0'}</div>
            <div className="text-sm text-muted-foreground">{t.home.donations}</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-muted/30">
            <Users className="w-10 h-10 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">200+</div>
            <div className="text-sm text-muted-foreground">{t.home.beneficiaries}</div>
          </div>
        </div>
        {stats && stats.recentDonations.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Donaciones Recientes</h3>
            <div className="space-y-3">
              {stats.recentDonations.map((d) => (
                <Card key={d.donation_id} className="border border-border/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{d.project_name || 'Libre Inversión'}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(d.date)}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{formatCurrency(d.amount, d.currency)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
