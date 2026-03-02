import React, { useMemo } from 'react';
import { RefreshCw, CalendarDays, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SummaryCards from '../components/SummaryCards';
import AssetAllocationChart from '../components/AssetAllocationChart';
import AssetGrowthCharts from '../components/AssetGrowthCharts';
import PortfolioForm from '../components/PortfolioForm';
import MonthYearPicker from '../components/MonthYearPicker';
import { useMonthlySnapshots } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import type { MonthlySnapshot } from '../backend';
import { formatINR } from '../utils/formatCurrency';

interface DashboardProps {
    userName?: string | null;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function Dashboard({ userName }: DashboardProps) {
    const queryClient = useQueryClient();
    const { data: snapshots, isLoading: snapshotsLoading } = useMonthlySnapshots();

    // Default to current month
    const [selectedMonth, setSelectedMonth] = React.useState<Date>(() => getStartOfMonth(new Date()));

    // Find snapshot for selected month
    const selectedMonthSnapshot: MonthlySnapshot | null = useMemo(() => {
        if (!snapshots) return null;
        const year = BigInt(selectedMonth.getFullYear());
        const month = BigInt(selectedMonth.getMonth() + 1);
        return snapshots.find((s) => s.year === year && s.month === month) ?? null;
    }, [snapshots, selectedMonth]);

    // Compute net worth for hero display
    const heroNetWorth = useMemo(() => {
        if (!selectedMonthSnapshot) return 0;
        const rsuValue = selectedMonthSnapshot.rsu.quantity * selectedMonthSnapshot.rsu.rate;
        const esopValue = selectedMonthSnapshot.esop.quantity * selectedMonthSnapshot.esop.rate;
        const goldValue = selectedMonthSnapshot.goldGrams * selectedMonthSnapshot.goldRate;
        const silverValue = selectedMonthSnapshot.silverGrams * selectedMonthSnapshot.silverRate;
        const totalAssets =
            selectedMonthSnapshot.indianEquity +
            selectedMonthSnapshot.usStocks +
            selectedMonthSnapshot.pf +
            selectedMonthSnapshot.nps +
            goldValue + silverValue +
            selectedMonthSnapshot.fd +
            selectedMonthSnapshot.mutualFunds +
            rsuValue + esopValue +
            selectedMonthSnapshot.dividends +
            selectedMonthSnapshot.interest;
        return totalAssets - selectedMonthSnapshot.homeLoan;
    }, [selectedMonthSnapshot]);

    // Portfolio breakdown rows for selected snapshot
    const breakdownRows = useMemo(() => {
        if (!selectedMonthSnapshot) return [];
        const s = selectedMonthSnapshot;
        return [
            { label: 'Indian Equity', value: s.indianEquity, color: 'bg-chart-1' },
            { label: 'US Stocks', value: s.usStocks, color: 'bg-chart-2' },
            { label: 'Provident Fund', value: s.pf, color: 'bg-chart-3' },
            { label: 'NPS', value: s.nps, color: 'bg-chart-4' },
            { label: 'Gold', value: s.goldGrams * s.goldRate, color: 'bg-chart-5' },
            { label: 'Silver', value: s.silverGrams * s.silverRate, color: 'bg-slate-400' },
            { label: 'Fixed Deposit', value: s.fd, color: 'bg-chart-6' },
            { label: 'Mutual Funds', value: s.mutualFunds, color: 'bg-chart-7' },
            { label: 'RSU', value: s.rsu.quantity * s.rsu.rate, color: 'bg-blue-500' },
            { label: 'ESOP', value: s.esop.quantity * s.esop.rate, color: 'bg-pink-500' },
        ].filter((r) => r.value > 0);
    }, [selectedMonthSnapshot]);

    const totalAssets = useMemo(() => breakdownRows.reduce((sum, r) => sum + r.value, 0), [breakdownRows]);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['monthlySnapshots'] });
    };

    const selectedMonthLabel = `${MONTH_NAMES[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        {userName ? `${userName}'s Portfolio` : 'My Portfolio'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monthly portfolio tracker — track your wealth over time
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <MonthYearPicker
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        disabled={snapshotsLoading}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={snapshotsLoading}
                        className="gap-2"
                    >
                        <RefreshCw size={14} className={snapshotsLoading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-card">
                <img
                    src="/assets/generated/portfolio-hero.dim_800x400.png"
                    alt="Portfolio overview"
                    className="w-full h-40 sm:h-52 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent flex items-end p-6">
                    <div className="text-primary-foreground">
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarDays size={13} className="opacity-80" />
                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">{selectedMonthLabel} — Net Worth</p>
                        </div>
                        {snapshotsLoading ? (
                            <Skeleton className="h-9 w-40 bg-white/20" />
                        ) : (
                            <p className="text-3xl sm:text-4xl font-bold">
                                {formatINR(heroNetWorth)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards
                snapshot={selectedMonthSnapshot}
                isLoading={snapshotsLoading}
            />

            {/* No data for selected month */}
            {!snapshotsLoading && !selectedMonthSnapshot && (
                <div className="bg-muted/40 border border-dashed border-border rounded-xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <PlusCircle size={22} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No data for {selectedMonthLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Fill in the form below to record your portfolio snapshot for this month.
                    </p>
                </div>
            )}

            {/* Chart + Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Asset Allocation Chart */}
                <div className="lg:col-span-2">
                    <AssetAllocationChart
                        snapshot={selectedMonthSnapshot}
                        isLoading={snapshotsLoading}
                    />
                </div>

                {/* Portfolio Breakdown */}
                <div className="lg:col-span-3">
                    <div className="bg-card rounded-xl border border-border shadow-card p-6 h-full">
                        <h2 className="text-lg font-semibold text-foreground tracking-tight mb-5">
                            Portfolio Breakdown
                            <span className="ml-2 text-sm font-normal text-muted-foreground">({selectedMonthLabel})</span>
                        </h2>
                        {snapshotsLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                        ) : breakdownRows.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-center">
                                <p className="text-sm text-muted-foreground">No data for this month yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {breakdownRows.map((item) => {
                                    const pct = totalAssets > 0 ? (item.value / totalAssets) * 100 : 0;
                                    return (
                                        <div key={item.label} className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                                            <span className="text-sm text-foreground flex-1 min-w-0 truncate">{item.label}</span>
                                            <span className="text-xs text-muted-foreground w-10 text-right">{pct.toFixed(1)}%</span>
                                            <span className="text-sm font-medium text-foreground w-28 text-right tabular-nums">
                                                {formatINR(item.value)}
                                            </span>
                                        </div>
                                    );
                                })}
                                {selectedMonthSnapshot && (selectedMonthSnapshot.dividends > 0 || selectedMonthSnapshot.interest > 0) && (
                                    <div className="pt-2 mt-2 border-t border-border space-y-2">
                                        {selectedMonthSnapshot.dividends > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-accent" />
                                                <span className="text-sm text-foreground flex-1">Dividends</span>
                                                <span className="text-xs text-muted-foreground w-10 text-right">—</span>
                                                <span className="text-sm font-medium text-foreground w-28 text-right tabular-nums">
                                                    {formatINR(selectedMonthSnapshot.dividends)}
                                                </span>
                                            </div>
                                        )}
                                        {selectedMonthSnapshot.interest > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-warning" />
                                                <span className="text-sm text-foreground flex-1">Interest Earned</span>
                                                <span className="text-xs text-muted-foreground w-10 text-right">—</span>
                                                <span className="text-sm font-medium text-foreground w-28 text-right tabular-nums">
                                                    {formatINR(selectedMonthSnapshot.interest)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Asset Growth Trend Charts */}
            {!snapshotsLoading && snapshots && snapshots.length > 0 && (
                <AssetGrowthCharts snapshots={snapshots} />
            )}

            {/* Portfolio Input Form */}
            <div>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">
                        {selectedMonthSnapshot ? 'Update' : 'Add'} Snapshot — {selectedMonthLabel}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {selectedMonthSnapshot
                            ? `Editing your portfolio snapshot for ${selectedMonthLabel}. Changes will overwrite the existing data.`
                            : `Enter your investment values for ${selectedMonthLabel} to create a new snapshot.`
                        }
                    </p>
                </div>
                <PortfolioForm
                    selectedMonth={selectedMonth}
                    selectedMonthSnapshot={selectedMonthSnapshot}
                    isLoading={snapshotsLoading}
                />
            </div>
        </div>
    );
}
