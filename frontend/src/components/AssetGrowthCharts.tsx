import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { MonthlySnapshot } from '../backend';
import { formatINRCompact } from '../utils/formatCurrency';

interface AssetGrowthChartsProps {
    snapshots: MonthlySnapshot[];
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface AssetConfig {
    key: string;
    label: string;
    color: string;
    getValue: (s: MonthlySnapshot) => number;
}

const ASSET_CONFIGS: AssetConfig[] = [
    { key: 'indianEquity', label: 'Indian Equity', color: '#4a9e6e', getValue: (s) => s.indianEquity },
    { key: 'usStocks', label: 'US Stocks', color: '#c9a227', getValue: (s) => s.usStocks },
    { key: 'pf', label: 'Provident Fund', color: '#e07b39', getValue: (s) => s.pf },
    { key: 'nps', label: 'NPS', color: '#5b8db8', getValue: (s) => s.nps },
    { key: 'gold', label: 'Gold', color: '#d4a017', getValue: (s) => s.goldGrams * s.goldRate },
    { key: 'silver', label: 'Silver', color: '#a8a8b3', getValue: (s) => s.silverGrams * s.silverRate },
    { key: 'fd', label: 'Fixed Deposit', color: '#d4596a', getValue: (s) => s.fd },
    { key: 'mutualFunds', label: 'Mutual Funds', color: '#5aaa8a', getValue: (s) => s.mutualFunds },
    { key: 'rsu', label: 'RSU', color: '#3a7bd5', getValue: (s) => s.rsu.quantity * s.rsu.rate },
    { key: 'esop', label: 'ESOP', color: '#e05c9a', getValue: (s) => s.esop.quantity * s.esop.rate },
    { key: 'dividends', label: 'Dividends', color: '#7c6fcd', getValue: (s) => s.dividends },
    { key: 'interest', label: 'Interest', color: '#52a8a0', getValue: (s) => s.interest },
];

interface DataPoint {
    month: string;
    value: number;
}

interface ChartCardProps {
    config: AssetConfig;
    data: DataPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg shadow-card-hover px-3 py-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{formatINRCompact(payload[0].value)}</p>
            </div>
        );
    }
    return null;
}

function ChartCard({ config, data }: ChartCardProps) {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const minValue = Math.min(...data.map((d) => d.value), 0);
    const hasGrowth = data.length >= 2 && data[data.length - 1].value > data[0].value;
    const hasDecline = data.length >= 2 && data[data.length - 1].value < data[0].value;

    return (
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: config.color }}
                    />
                    <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
                </div>
                {data.length >= 2 && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        hasGrowth
                            ? 'bg-success/10 text-success'
                            : hasDecline
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-muted-foreground'
                    }`}>
                        {hasGrowth ? '↑' : hasDecline ? '↓' : '—'}{' '}
                        {data.length >= 2
                            ? Math.abs(((data[data.length - 1].value - data[0].value) / (data[0].value || 1)) * 100).toFixed(1) + '%'
                            : ''}
                    </span>
                )}
            </div>
            <p className="text-lg font-bold text-foreground mb-3">
                {formatINRCompact(data[data.length - 1]?.value ?? 0)}
            </p>
            <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatINRCompact(v)}
                        domain={[Math.max(0, minValue * 0.95), maxValue * 1.05]}
                        width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={config.color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: config.color, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: config.color, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function AssetGrowthCharts({ snapshots }: AssetGrowthChartsProps) {
    // Sort snapshots by year then month
    const sorted = React.useMemo(() => {
        return [...snapshots].sort((a, b) => {
            const yearDiff = Number(a.year) - Number(b.year);
            if (yearDiff !== 0) return yearDiff;
            return Number(a.month) - Number(b.month);
        });
    }, [snapshots]);

    // Build time-series data per asset
    const assetCharts = React.useMemo(() => {
        return ASSET_CONFIGS
            .map((config) => {
                const data: DataPoint[] = sorted.map((s) => ({
                    month: `${MONTH_ABBR[Number(s.month) - 1]} ${String(Number(s.year)).slice(2)}`,
                    value: config.getValue(s),
                }));
                const hasNonZero = data.some((d) => d.value > 0);
                return { config, data, hasNonZero };
            })
            .filter((item) => item.hasNonZero);
    }, [sorted]);

    if (assetCharts.length === 0) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Asset Growth Trends</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Monthly value progression across all asset classes
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {assetCharts.map(({ config, data }) => (
                    <ChartCard key={config.key} config={config} data={data} />
                ))}
            </div>
        </section>
    );
}
