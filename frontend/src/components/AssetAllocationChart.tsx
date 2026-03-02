import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import type { MonthlySnapshot } from '../backend';
import { formatINR } from '../utils/formatCurrency';
import { Skeleton } from '@/components/ui/skeleton';

interface AssetAllocationChartProps {
    snapshot: MonthlySnapshot | null | undefined;
    isLoading?: boolean;
}

const ASSET_COLORS = [
    '#4a9e6e', // green - Indian Equity
    '#c9a227', // gold - US Stocks
    '#e07b39', // orange - PF
    '#5b8db8', // steel blue - NPS
    '#d4a017', // amber - Gold
    '#a8a8b3', // silver-grey - Silver
    '#d4596a', // rose - FD
    '#5aaa8a', // teal - Mutual Funds
    '#3a7bd5', // blue - RSU
    '#e05c9a', // pink - ESOP
    '#7c6fcd', // purple - Dividends
    '#52a8a0', // teal-green - Interest
];

interface ChartEntry {
    name: string;
    value: number;
    key: string;
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
}) {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: ChartEntry }> }) {
    if (active && payload && payload.length) {
        const entry = payload[0];
        return (
            <div className="bg-card border border-border rounded-lg shadow-card-hover px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{formatINR(entry.value)}</p>
            </div>
        );
    }
    return null;
}

function computeChartData(snapshot: MonthlySnapshot): ChartEntry[] {
    const rsuValue = snapshot.rsu.quantity * snapshot.rsu.rate;
    const esopValue = snapshot.esop.quantity * snapshot.esop.rate;
    const goldValue = snapshot.goldGrams * snapshot.goldRate;
    const silverValue = snapshot.silverGrams * snapshot.silverRate;

    const entries: ChartEntry[] = [
        { key: 'indianEquity', name: 'Indian Equity', value: snapshot.indianEquity },
        { key: 'usStocks', name: 'US Stocks', value: snapshot.usStocks },
        { key: 'pf', name: 'Provident Fund', value: snapshot.pf },
        { key: 'nps', name: 'NPS', value: snapshot.nps },
        { key: 'gold', name: 'Gold', value: goldValue },
        { key: 'silver', name: 'Silver', value: silverValue },
        { key: 'fd', name: 'Fixed Deposit', value: snapshot.fd },
        { key: 'mutualFunds', name: 'Mutual Funds', value: snapshot.mutualFunds },
        { key: 'rsu', name: 'RSU', value: rsuValue },
        { key: 'esop', name: 'ESOP', value: esopValue },
        { key: 'dividends', name: 'Dividends', value: snapshot.dividends },
        { key: 'interest', name: 'Interest', value: snapshot.interest },
    ];

    return entries.filter((e) => e.value > 0);
}

export default function AssetAllocationChart({ snapshot, isLoading }: AssetAllocationChartProps) {
    const chartData: ChartEntry[] = React.useMemo(() => {
        if (!snapshot) return [];
        return computeChartData(snapshot);
    }, [snapshot]);

    const totalAssets = chartData.reduce((sum, entry) => sum + entry.value, 0);

    if (isLoading) {
        return (
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Asset Allocation</h2>
                {totalAssets > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {chartData.length} categories
                    </span>
                )}
            </div>

            {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No asset data yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add values in the form below to see your allocation</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            innerRadius={50}
                            dataKey="value"
                            labelLine={false}
                            label={renderCustomLabel}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={entry.key}
                                    fill={ASSET_COLORS[index % ASSET_COLORS.length]}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => (
                                <span className="text-xs text-foreground">{value}</span>
                            )}
                            iconType="circle"
                            iconSize={8}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
