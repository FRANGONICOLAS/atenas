import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DollarSign, Heart, RefreshCw, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { boldService } from '@/api/services/bold.service';
import type { BoldTransactionWithProject } from '@/types/bold.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [800, 1600];

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

const formatCurrency = (amount: number, currency?: string) => {
  const finalCurrency = currency || 'COP';
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

const getProjectName = (tx: BoldTransactionWithProject) => {
  return tx.project?.name || 'Libre Inversión';
};

const getPaymentMethodLabel = (value?: string | null) => {
  if (!value) return 'No especificado';
  const map: Record<string, string> = {
    CARD: 'Tarjeta',
    PSE: 'PSE',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    BANCOLOMBIA_TRANSFER: 'Bancolombia Transferencia',
    BANCOLOMBIA_QR: 'Bancolombia QR',
  };
  return map[value.toUpperCase()] ?? value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
};

type DonationImpact = {
  goal: number;
  raised: number;
  progress: number;
};

const getDonationImpact = (
  tx: BoldTransactionWithProject,
  projectMap: Map<string, { goal: number; raised: number; progress: number }>
): DonationImpact | null => {
  if (!tx.project_id) return null;
  const projectInfo = projectMap.get(tx.project_id);
  if (!projectInfo) return null;

  return {
    goal: projectInfo.goal,
    raised: projectInfo.raised,
    progress: Math.min(Math.max(projectInfo.progress, 0), 100),
  };
};

const getMotivationalMessage = (
  impact: DonationImpact | null,
  donationAmount: number,
  t: ReturnType<typeof useLanguage>['t']
) => {
  if (!impact || impact.goal <= 0) {
    return t.donatorDashboard.cards.messages.everyContribution;
  }

  if (impact.progress >= 100) {
    return t.donatorDashboard.cards.messages.goalCompleted;
  }

  if (impact.progress >= 80) {
    return t.donatorDashboard.cards.messages.closeToGoal;
  }

  if (donationAmount >= impact.goal * 0.2) {
    return t.donatorDashboard.cards.messages.highImpact;
  }

  return t.donatorDashboard.cards.messages.growingImpact;
};

export const DonationsHistory = () => {
  const { t } = useLanguage();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { projects } = useProjects();
  const [transactions, setTransactions] = useState<BoldTransactionWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user?.id) {
      setTransactions([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isActive = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const loadTransactions = async (attempt = 0) => {
      if (!isActive) return;
      if (attempt === 0) {
        setLoading(true);
        setError(null);
      }

      try {
        const data = await boldService.getUserBoldTransactionsWithProjects(user.id);
        if (!isActive) return;
        setTransactions(data);
        setLoading(false);
        setRetryCount(0);
      } catch (err) {
        if (!isActive) return;
        if (attempt < MAX_RETRIES) {
          const nextAttempt = attempt + 1;
          setRetryCount(nextAttempt);
          retryTimer = setTimeout(() => loadTransactions(nextAttempt), RETRY_DELAYS_MS[attempt]);
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar donaciones');
          setLoading(false);
        }
      }
    };

    loadTransactions(0);

    return () => {
      isActive = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [user?.id, isAuthLoading]);

  const sortedTransactions = useMemo(() => {
    const items = [...transactions];

    items.sort((a, b) => {
      const amountA = a.amount ?? 0;
      const amountB = b.amount ?? 0;
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();

      switch (sortBy) {
        case 'date_asc':  return dateA - dateB;
        case 'amount_desc': return amountB - amountA;
        case 'amount_asc':  return amountA - amountB;
        case 'date_desc':
        default:           return dateB - dateA;
      }
    });

    return items;
  }, [transactions, sortBy]);

  const projectMap = useMemo(() => {
    return new Map(
      projects
        .filter((project) => Boolean(project.project_id))
        .map((project) => [
          project.project_id as string,
          {
            goal: project.goal ?? 0,
            raised: project.raised ?? 0,
            progress: project.progress ?? 0,
          },
        ])
    );
  }, [projects]);

  const handleRetry = () => {
    if (!user?.id) return;
    setError(null);
    setRetryCount(0);
    setLoading(true);
    boldService
      .getUserBoldTransactionsWithProjects(user.id)
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar donaciones');
        setLoading(false);
      });
  };

  // const getStatusBadge = (status: string) => {
  //   const upper = status?.toUpperCase();
  //   const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  //     APPROVED: { variant: 'default', label: t.donatorDashboard.transactionStatus.APPROVED },
  //     PENDING:  { variant: 'secondary', label: t.donatorDashboard.transactionStatus.PENDING },
  //     DECLINED: { variant: 'destructive', label: t.donatorDashboard.transactionStatus.DECLINED },
  //     ERROR:    { variant: 'destructive', label: t.donatorDashboard.transactionStatus.ERROR },
  //   };
  //   const cfg = variants[upper] ?? { variant: 'outline' as const, label: status };
  //   return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  // };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-xl">{t.donatorDashboard.titles.donations}</CardTitle>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder={t.donatorDashboard.actions.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">{t.donatorDashboard.sort.dateNewest}</SelectItem>
              <SelectItem value="date_asc">{t.donatorDashboard.sort.dateOldest}</SelectItem>
              <SelectItem value="amount_desc">{t.donatorDashboard.sort.amountHigh}</SelectItem>
              <SelectItem value="amount_asc">{t.donatorDashboard.sort.amountLow}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRetry} disabled={loading || !user?.id}>
            <RefreshCw className="h-4 w-4" />
            {t.donatorDashboard.actions.refresh}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-blue-600" />
            <p>{t.donatorDashboard.status.loadingDonations}</p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground/80">
                {t.donatorDashboard.actions.retry} {retryCount + 1}
              </p>
            )}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              {t.donatorDashboard.actions.retry}
            </Button>
          </div>
        )}

        {!loading && !error && sortedTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <DollarSign className="h-10 w-10 opacity-50" />
            <p>{t.donatorDashboard.status.noDonations}</p>
          </div>
        )}

        {!loading && !error && sortedTransactions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedTransactions.map((tx) => {
              const impact = getDonationImpact(tx, projectMap);
              const motivationalMessage = getMotivationalMessage(impact, tx.amount ?? 0, t);

              return (
                <Card
                  key={tx.bold_transaction_id}
                  className="border border-border/60 bg-gradient-to-br from-background to-muted/20"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t.donatorDashboard.table.project}
                        </p>
                        <h3 className="font-semibold text-foreground leading-tight truncate">
                          {getProjectName(tx)}
                        </h3>
                        {tx.project?.category && (
                          <Badge variant="outline" className="text-xs">
                            {tx.project.category}
                          </Badge>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t.donatorDashboard.table.amount}
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-md border border-border/50 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Target className="h-4 w-4 text-blue-600" />
                          {t.donatorDashboard.cards.labels.projectGoal}
                        </span>
                        <span className="font-semibold">
                          {impact ? formatCurrency(impact.goal, tx.currency) : t.donatorDashboard.cards.labels.notAvailable}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            {t.donatorDashboard.cards.labels.projectProgress}
                          </span>
                          <span className="font-semibold">{impact ? `${impact.progress}%` : '0%'}</span>
                        </div>
                        <Progress value={impact?.progress ?? 0} className="h-2" />
                        {impact && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(impact.raised, tx.currency)} / {formatCurrency(impact.goal, tx.currency)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t.donatorDashboard.cards.labels.donatedAt}</p>
                        <p className="font-medium">{formatDate(tx.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.donatorDashboard.cards.labels.paymentMethod}</p>
                        <p className="font-medium">{getPaymentMethodLabel(tx.payment_method)}</p>
                      </div>
                    </div>

                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                      <p className="flex items-start gap-2 text-sm text-emerald-900">
                        <Heart className="h-4 w-4 mt-0.5 text-emerald-700 shrink-0" />
                        <span>{motivationalMessage}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
