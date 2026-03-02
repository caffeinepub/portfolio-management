import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, RefreshCw, TrendingUp, Landmark, Coins, Briefcase, CreditCard, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSaveMonthlySnapshot } from '@/hooks/useQueries';
import { fetchMockStockRate, fetchMockGoldRate, fetchMockSilverRate } from '@/utils/mockRateFetcher';
import type { MonthlySnapshot } from '@/backend';

interface PortfolioFormProps {
  selectedMonth: Date;
  selectedMonthSnapshot: MonthlySnapshot | null | undefined;
  isLoading?: boolean;
}

interface FormValues {
  indianEquity: string;
  usStocks: string;
  pf: string;
  nps: string;
  fd: string;
  mutualFunds: string;
  rsuStockName: string;
  rsuQuantity: string;
  rsuRate: string;
  esopStockName: string;
  esopQuantity: string;
  esopRate: string;
  goldGrams: string;
  goldRate: string;
  silverGrams: string;
  silverRate: string;
  homeLoan: string;
  dividends: string;
  interest: string;
}

const EMPTY_FORM: FormValues = {
  indianEquity: '',
  usStocks: '',
  pf: '',
  nps: '',
  fd: '',
  mutualFunds: '',
  rsuStockName: '',
  rsuQuantity: '',
  rsuRate: '',
  esopStockName: '',
  esopQuantity: '',
  esopRate: '',
  goldGrams: '',
  goldRate: '',
  silverGrams: '',
  silverRate: '',
  homeLoan: '',
  dividends: '',
  interest: '',
};

function snapshotToForm(s: MonthlySnapshot): FormValues {
  const n = (v: number) => (v > 0 ? String(v) : '');
  return {
    indianEquity: n(s.indianEquity),
    usStocks: n(s.usStocks),
    pf: n(s.pf),
    nps: n(s.nps),
    fd: n(s.fd),
    mutualFunds: n(s.mutualFunds),
    rsuStockName: s.rsu.stockName,
    rsuQuantity: n(s.rsu.quantity),
    rsuRate: n(s.rsu.rate),
    esopStockName: s.esop.stockName,
    esopQuantity: n(s.esop.quantity),
    esopRate: n(s.esop.rate),
    goldGrams: n(s.goldGrams),
    goldRate: n(s.goldRate),
    silverGrams: n(s.silverGrams),
    silverRate: n(s.silverRate),
    homeLoan: n(s.homeLoan),
    dividends: n(s.dividends),
    interest: n(s.interest),
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function PortfolioForm({ selectedMonth, selectedMonthSnapshot, isLoading }: PortfolioFormProps) {
  const { mutate: saveSnapshot, isPending } = useSaveMonthlySnapshot();

  const [fetchingGold, setFetchingGold] = useState(false);
  const [fetchingSilver, setFetchingSilver] = useState(false);
  const [fetchingRsu, setFetchingRsu] = useState(false);
  const [fetchingEsop, setFetchingEsop] = useState(false);

  const [goldRateEstimated, setGoldRateEstimated] = useState(false);
  const [silverRateEstimated, setSilverRateEstimated] = useState(false);
  const [rsuRateEstimated, setRsuRateEstimated] = useState(false);
  const [esopRateEstimated, setEsopRateEstimated] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    reset(selectedMonthSnapshot ? snapshotToForm(selectedMonthSnapshot) : EMPTY_FORM);
    setGoldRateEstimated(false);
    setSilverRateEstimated(false);
    setRsuRateEstimated(false);
    setEsopRateEstimated(false);
  }, [selectedMonthSnapshot, selectedMonth, reset]);

  const watchedValues = watch();

  const rsuValue =
    (parseFloat(watchedValues.rsuQuantity || '0') || 0) *
    (parseFloat(watchedValues.rsuRate || '0') || 0);
  const esopValue =
    (parseFloat(watchedValues.esopQuantity || '0') || 0) *
    (parseFloat(watchedValues.esopRate || '0') || 0);
  const goldValue =
    (parseFloat(watchedValues.goldGrams || '0') || 0) *
    (parseFloat(watchedValues.goldRate || '0') || 0);
  const silverValue =
    (parseFloat(watchedValues.silverGrams || '0') || 0) *
    (parseFloat(watchedValues.silverRate || '0') || 0);

  const handleFetchGoldRate = async () => {
    setFetchingGold(true);
    try {
      const rate = await fetchMockGoldRate();
      setValue('goldRate', String(rate));
      setGoldRateEstimated(true);
      toast.success(`Gold rate fetched: ₹${rate.toLocaleString('en-IN')}/gram (estimated)`);
    } catch {
      toast.error('Failed to fetch gold rate');
    } finally {
      setFetchingGold(false);
    }
  };

  const handleFetchSilverRate = async () => {
    setFetchingSilver(true);
    try {
      const rate = await fetchMockSilverRate();
      setValue('silverRate', String(rate));
      setSilverRateEstimated(true);
      toast.success(`Silver rate fetched: ₹${rate.toLocaleString('en-IN')}/gram (estimated)`);
    } catch {
      toast.error('Failed to fetch silver rate');
    } finally {
      setFetchingSilver(false);
    }
  };

  const handleFetchRsuRate = async () => {
    const stockName = watchedValues.rsuStockName?.trim();
    if (!stockName) {
      toast.error('Please enter a stock name first');
      return;
    }
    setFetchingRsu(true);
    try {
      const rate = await fetchMockStockRate(stockName);
      setValue('rsuRate', String(rate));
      setRsuRateEstimated(true);
      toast.success(`${stockName.toUpperCase()} rate fetched: ₹${rate.toLocaleString('en-IN')}/share (estimated)`);
    } catch {
      toast.error('Failed to fetch stock rate');
    } finally {
      setFetchingRsu(false);
    }
  };

  const handleFetchEsopRate = async () => {
    const stockName = watchedValues.esopStockName?.trim();
    if (!stockName) {
      toast.error('Please enter a stock name first');
      return;
    }
    setFetchingEsop(true);
    try {
      const rate = await fetchMockStockRate(stockName);
      setValue('esopRate', String(rate));
      setEsopRateEstimated(true);
      toast.success(`${stockName.toUpperCase()} rate fetched: ₹${rate.toLocaleString('en-IN')}/share (estimated)`);
    } catch {
      toast.error('Failed to fetch stock rate');
    } finally {
      setFetchingEsop(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    const snapshot: MonthlySnapshot = {
      year: BigInt(selectedMonth.getFullYear()),
      month: BigInt(selectedMonth.getMonth() + 1),
      indianEquity: parseFloat(data.indianEquity || '0') || 0,
      usStocks: parseFloat(data.usStocks || '0') || 0,
      pf: parseFloat(data.pf || '0') || 0,
      nps: parseFloat(data.nps || '0') || 0,
      fd: parseFloat(data.fd || '0') || 0,
      mutualFunds: parseFloat(data.mutualFunds || '0') || 0,
      rsu: {
        stockName: data.rsuStockName || '',
        quantity: parseFloat(data.rsuQuantity || '0') || 0,
        rate: parseFloat(data.rsuRate || '0') || 0,
      },
      esop: {
        stockName: data.esopStockName || '',
        quantity: parseFloat(data.esopQuantity || '0') || 0,
        rate: parseFloat(data.esopRate || '0') || 0,
      },
      goldGrams: parseFloat(data.goldGrams || '0') || 0,
      goldRate: parseFloat(data.goldRate || '0') || 0,
      silverGrams: parseFloat(data.silverGrams || '0') || 0,
      silverRate: parseFloat(data.silverRate || '0') || 0,
      homeLoan: parseFloat(data.homeLoan || '0') || 0,
      dividends: parseFloat(data.dividends || '0') || 0,
      interest: parseFloat(data.interest || '0') || 0,
    };

    const monthLabel = `${MONTH_NAMES[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;

    saveSnapshot(snapshot, {
      onSuccess: () => toast.success(`Snapshot saved for ${monthLabel}`),
      onError: () => toast.error('Failed to save snapshot. Please try again.'),
    });
  };

  const formatINR = (value: number) =>
    value > 0 ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6">
            <div className="h-5 bg-muted rounded w-32 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-14 bg-muted rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const monthLabel = `${MONTH_NAMES[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Assets Section */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="indianEquity">Indian Equity (₹)</Label>
            <p className="text-xs text-muted-foreground">NSE/BSE stocks &amp; ETFs</p>
            <Input
              id="indianEquity"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('indianEquity')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="usStocks">US Stocks (₹)</Label>
            <p className="text-xs text-muted-foreground">NYSE/NASDAQ holdings (₹ equivalent)</p>
            <Input
              id="usStocks"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('usStocks')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf">Provident Fund (₹)</Label>
            <p className="text-xs text-muted-foreground">EPF / PPF balance</p>
            <Input
              id="pf"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('pf')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nps">NPS (₹)</Label>
            <p className="text-xs text-muted-foreground">National Pension System corpus</p>
            <Input
              id="nps"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('nps')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fd">Fixed Deposit (₹)</Label>
            <p className="text-xs text-muted-foreground">Bank &amp; corporate FDs</p>
            <Input
              id="fd"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('fd')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mutualFunds">Mutual Funds (₹)</Label>
            <p className="text-xs text-muted-foreground">Equity, debt &amp; hybrid funds</p>
            <Input
              id="mutualFunds"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('mutualFunds')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Precious Metals Section */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Coins className="h-4 w-4 text-warning" />
            Precious Metals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Gold */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Gold
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goldGrams">Quantity (grams)</Label>
                <Input
                  id="goldGrams"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  {...register('goldGrams')}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="goldRate">Rate (₹/gram)</Label>
                  {goldRateEstimated && (
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">Estimated</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="goldRate"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    {...register('goldRate')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleFetchGoldRate}
                    disabled={fetchingGold}
                    title="Fetch estimated gold rate"
                  >
                    {fetchingGold ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Value</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-muted text-sm font-medium">
                  {formatINR(goldValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Silver */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              Silver
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="silverGrams">Quantity (grams)</Label>
                <Input
                  id="silverGrams"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  {...register('silverGrams')}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="silverRate">Rate (₹/gram)</Label>
                  {silverRateEstimated && (
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">Estimated</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="silverRate"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    {...register('silverRate')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleFetchSilverRate}
                    disabled={fetchingSilver}
                    title="Fetch estimated silver rate"
                  >
                    {fetchingSilver ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Value</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-muted text-sm font-medium">
                  {formatINR(silverValue)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equity Compensation Section */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Briefcase className="h-4 w-4 text-success" />
            Equity Compensation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* RSU */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">RSU (Restricted Stock Units)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="space-y-1.5">
                <Label htmlFor="rsuStockName">Stock Name / Ticker</Label>
                <Input
                  id="rsuStockName"
                  type="text"
                  placeholder="e.g. AAPL, GOOGL, MSFT"
                  {...register('rsuStockName')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rsuQuantity">Quantity (shares)</Label>
                <Input
                  id="rsuQuantity"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  {...register('rsuQuantity')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rsuRate">Rate per Share (₹)</Label>
                  {rsuRateEstimated && (
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">Estimated Rate</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="rsuRate"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    {...register('rsuRate')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleFetchRsuRate}
                    disabled={fetchingRsu}
                    title="Fetch estimated stock rate (USD→INR)"
                  >
                    {fetchingRsu ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  USD price × INR/USD rate (₹83–₹85)
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Total Value</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-muted text-sm font-medium">
                  {formatINR(rsuValue)}
                </div>
              </div>
            </div>
          </div>

          {/* ESOP */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">ESOP (Employee Stock Options)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="space-y-1.5">
                <Label htmlFor="esopStockName">Stock Name / Ticker</Label>
                <Input
                  id="esopStockName"
                  type="text"
                  placeholder="e.g. AAPL, GOOGL, MSFT"
                  {...register('esopStockName')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="esopQuantity">Quantity (shares)</Label>
                <Input
                  id="esopQuantity"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  {...register('esopQuantity')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="esopRate">Rate per Share (₹)</Label>
                  {esopRateEstimated && (
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">Estimated Rate</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="esopRate"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    {...register('esopRate')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleFetchEsopRate}
                    disabled={fetchingEsop}
                    title="Fetch estimated stock rate (USD→INR)"
                  >
                    {fetchingEsop ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  USD price × INR/USD rate (₹83–₹85)
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Total Value</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-muted text-sm font-medium">
                  {formatINR(esopValue)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liabilities Section */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CreditCard className="h-4 w-4 text-destructive" />
            Liabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="homeLoan">Home Loan Outstanding (₹)</Label>
            <Input
              id="homeLoan"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('homeLoan')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Passive Income Section */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Landmark className="h-4 w-4 text-primary" />
            Passive Income
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dividends">Dividends (₹)</Label>
            <Input
              id="dividends"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('dividends')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="interest">Interest Income (₹)</Label>
            <Input
              id="interest"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              {...register('interest')}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Snapshot…
          </>
        ) : (
          `Save Snapshot for ${monthLabel}`
        )}
      </Button>
    </form>
  );
}
