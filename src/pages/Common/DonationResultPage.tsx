import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Home } from 'lucide-react';
import { donationService } from '@/api/services/donation.service';
import { boldService } from '@/api/services/bold.service';

const DonationResultPage = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'approved' | 'declined' | 'pending' | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const syncRef = useRef(false);

  useEffect(() => {
    // Obtener parámetros de la URL
    const txStatus = searchParams.get('bold-tx-status');
    const txOrderId = searchParams.get('bold-order-id');

    if (txStatus) {
      setStatus(txStatus as 'approved' | 'declined' | 'pending');
    }
    if (txOrderId) {
      setOrderId(txOrderId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status !== 'approved' || !orderId || syncRef.current) {
      return;
    }

    syncRef.current = true;

    const syncDonation = async () => {
      try {
        const transaction = await boldService.getBoldTransactionByOrderId(orderId);
        if (!transaction || transaction.donation_id) {
          return;
        }

        const dateValue = transaction.created_at
          ? transaction.created_at.split('T')[0]
          : new Date().toISOString().split('T')[0];

        const donation = await donationService.createDonation({
          user_id: transaction.user_id,
          project_id: transaction.project_id ?? null,
          amount: transaction.amount,
          currency: transaction.currency || 'COP',
          status: 'approved',
          date: dateValue,
          pay_method: 'bold',
          approve_code: orderId,
        });

        await boldService.updateBoldTransaction(orderId, {
          donation_id: donation.donation_id,
          status: 'APPROVED',
        });
      } catch (error) {
        console.error('Error syncing donation:', error);
      }
    };

    void syncDonation();
  }, [status, orderId]);

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <Check className="w-16 h-16 text-green-600" />,
          bgColor: 'bg-green-100',
          title: t.donation.results.success.title,
          message: t.donation.results.success.message,
          buttonText: t.donation.results.success.button,
          buttonLink: '/donator?tab=donations',
        };
      case 'declined':
        return {
          icon: <X className="w-16 h-16 text-red-600" />,
          bgColor: 'bg-red-100',
          title: t.donation.results.declined.title,
          message: t.donation.results.declined.message,
          buttonText: t.donation.results.declined.button,
          buttonLink: '/donation',
        };
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          title: t.donation.results.pending.title,
          message: t.donation.results.pending.message,
          buttonText: t.donation.results.pending.button,
          buttonLink: '/donator?tab=donations',
        };
      default:
        return {
          icon: <Clock className="w-16 h-16 text-gray-600" />,
          bgColor: 'bg-gray-100',
          title: t.donation.results.process.title,
          message: t.donation.results.process.message,
          buttonText: t.donation.results.process.button,
          buttonLink: '/',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen pt-20 bg-background flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
            {config.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {config.title}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            {config.message}
          </p>

          {orderId && (
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-1">{t.donation.results.orderId}</p>
              <p className="font-mono text-sm font-medium">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link to={config.buttonLink}>
              <Button className="w-full">
                {config.buttonText}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full gap-2">
                <Home className="w-4 h-4" />
                {t.donation.results.process.button}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationResultPage;
