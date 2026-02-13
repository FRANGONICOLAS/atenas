import { useEffect, useMemo, useState } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { donationService } from '@/api/services/donation.service';
import type { DonationWithProject } from '@/types/donation.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [800, 1600];

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

const parseAmount = (value: string | number | null | undefined) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (amount: number, currency?: string) => {
  const finalCurrency = currency || 'USD';
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: finalCurrency,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${finalCurrency} ${amount.toFixed(2)}`;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha invalida';
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getProjectName = (donation: DonationWithProject) => {
  return donation.project?.name || 'Proyecto sin nombre';
};

const getPaymentMethodLabel = (value?: string | null) => {
  if (!value) return 'No especificado';
  const normalized = value.replace(/_/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const DonationsHistory = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [donations, setDonations] = useState<DonationWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user?.id) {
      setDonations([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isActive = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const loadDonations = async (attempt = 0) => {
      if (!isActive) return;
      if (attempt === 0) {
        setLoading(true);
        setError(null);
      }

      try {
        const data = await donationService.getUserDonations(user.id);
        if (!isActive) return;
        setDonations(data);
        setLoading(false);
        setRetryCount(0);
      } catch (err) {
        if (!isActive) return;
        if (attempt < MAX_RETRIES) {
          const nextAttempt = attempt + 1;
          setRetryCount(nextAttempt);
          retryTimer = setTimeout(() => loadDonations(nextAttempt), RETRY_DELAYS_MS[attempt]);
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar donaciones');
          setLoading(false);
        }
      }
    };

    loadDonations(0);

    return () => {
      isActive = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [user?.id, isAuthLoading]);

  const sortedDonations = useMemo(() => {
    const items = [...donations];

    items.sort((a, b) => {
      const amountA = parseAmount(a.amount);
      const amountB = parseAmount(b.amount);
      const dateA = new Date(a.date || a.created_at || '').getTime();
      const dateB = new Date(b.date || b.created_at || '').getTime();

      switch (sortBy) {
        case 'date_asc':
          return dateA - dateB;
        case 'amount_desc':
          return amountB - amountA;
        case 'amount_asc':
          return amountA - amountB;
        case 'date_desc':
        default:
          return dateB - dateA;
      }
    });

    return items;
  }, [donations, sortBy]);

  const handleRetry = () => {
    if (!user?.id) return;
    setError(null);
    setRetryCount(0);
    setLoading(true);
    donationService
      .getUserDonations(user.id)
      .then((data) => {
        setDonations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar donaciones');
        setLoading(false);
      });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-xl">Historial de donaciones</CardTitle>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Fecha: mas reciente</SelectItem>
              <SelectItem value="date_asc">Fecha: mas antigua</SelectItem>
              <SelectItem value="amount_desc">Monto: mayor a menor</SelectItem>
              <SelectItem value="amount_asc">Monto: menor a mayor</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRetry} disabled={loading || !user?.id}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-blue-600" />
            <p>Cargando donaciones...</p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground/80">
                Reintentando... intento {retryCount + 1}
              </p>
            )}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && sortedDonations.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <DollarSign className="h-10 w-10 opacity-50" />
            <p>No hay donaciones registradas.</p>
          </div>
        )}

        {!loading && !error && sortedDonations.length > 0 && (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Metodo de pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDonations.map((donation) => {
                    const amount = parseAmount(donation.amount);
                    const displayDate = donation.date || donation.created_at;

                    return (
                      <TableRow key={donation.donation_id}>
                        <TableCell className="font-medium">
                          {getProjectName(donation)}
                        </TableCell>
                        <TableCell>{donation.currency || 'USD'}</TableCell>
                        <TableCell>{formatCurrency(amount, donation.currency)}</TableCell>
                        <TableCell>{formatDate(displayDate)}</TableCell>
                        <TableCell>{getPaymentMethodLabel(donation.pay_method)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4 md:hidden">
              {sortedDonations.map((donation) => {
                const amount = parseAmount(donation.amount);
                const displayDate = donation.date || donation.created_at;

                return (
                  <div
                    key={donation.donation_id}
                    className="rounded-lg border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Proyecto</p>
                        <p className="font-semibold text-foreground">{getProjectName(donation)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Monto</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(amount, donation.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Moneda</p>
                        <p className="font-medium">{donation.currency || 'USD'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fecha</p>
                        <p className="font-medium">{formatDate(displayDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Metodo de pago</p>
                        <p className="font-medium">{getPaymentMethodLabel(donation.pay_method)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
