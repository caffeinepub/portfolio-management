import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';
import { Skeleton } from '@/components/ui/skeleton';
import type { MonthlySnapshot } from '../backend';

interface SummaryCardsProps {
    snapshot: MonthlySnapshot | null | undefined;
    isLoading?: boolean;
}

interface SummaryCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    isLoading?: boolean;
    subtitle?: string;
}

function SummaryCard({ title, value, icon, colorClass, bgClass, isLoading, subtitle }: SummaryCardProps) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgClass}`}>
                    <span className={colorClass}>{icon}</span>
                </div>
            </div>
            {isLoading ? (
                <Skeleton className="h-8 w-36" />
            ) : (
                <div>
                    <p className={`text-2xl font-bold tracking-tight ${colorClass}`}>
                        {formatINR(value)}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
            )}
        </div>
    );
}

function computeFromSnapshot(snapshot: MonthlySnapshot) {
    const rsuValue = snapshot.rsu.quantity * snapshot.rsu.rate;
    const esopValue = snapshot.esop.quantity * snapshot.esop.rate;
    const goldValue = snapshot.goldGrams * snapshot.goldRate;
    const silverValue = snapshot.silverGrams * snapshot.silverRate;

    const totalAssets =
        snapshot.indianEquity +
        snapshot.usStocks +
        snapshot.pf +
        snapshot.nps +
        goldValue +
        silverValue +
        snapshot.fd +
        snapshot.mutualFunds +
        rsuValue +
        esopValue +
        snapshot.dividends +
        snapshot.interest;

    const totalLiabilities = snapshot.homeLoan;
    const netWorth = totalAssets - totalLiabilities;

    return { totalAssets, totalLiabilities, netWorth };
}

export default function SummaryCards({ snapshot, isLoading }: SummaryCardsProps) {
    const { totalAssets, totalLiabilities, netWorth } = React.useMemo(() => {
        if (!snapshot) return { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };
        return computeFromSnapshot(snapshot);
    }, [snapshot]);

    const netWorthPositive = netWorth >= 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
                title="Total Assets"
                value={totalAssets}
                icon={<TrendingUp size={18} />}
                colorClass="text-success"
                bgClass="bg-success/10"
                isLoading={isLoading}
                subtitle="All investments & savings"
            />
            <SummaryCard
                title="Total Liabilities"
                value={totalLiabilities}
                icon={<TrendingDown size={18} />}
                colorClass="text-destructive"
                bgClass="bg-destructive/10"
                isLoading={isLoading}
                subtitle="Outstanding loans"
            />
            <SummaryCard
                title="Net Worth"
                value={netWorth}
                icon={<Wallet size={18} />}
                colorClass={netWorthPositive ? 'text-primary' : 'text-destructive'}
                bgClass={netWorthPositive ? 'bg-primary/10' : 'bg-destructive/10'}
                isLoading={isLoading}
                subtitle="Assets minus liabilities"
            />
        </div>
    );
}
