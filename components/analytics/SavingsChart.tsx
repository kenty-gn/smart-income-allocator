'use client';

import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { MonthlyStats } from '@/types/database';

interface SavingsChartProps {
    data: MonthlyStats[];
}

export function SavingsChart({ data }: SavingsChartProps) {
    const formatCurrency = (value: number) => {
        if (Math.abs(value) >= 10000) {
            return `${(value / 10000).toFixed(1)}万`;
        }
        return `${value.toLocaleString()}`;
    };

    const formatMonth = (month: string) => {
        const [, m] = month.split('-');
        return `${parseInt(m)}月`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
        >
            <h3 className="mb-6 text-lg font-semibold text-white">月別貯蓄額</h3>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="month"
                            tickFormatter={formatMonth}
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                            }}
                            labelFormatter={formatMonth}
                            formatter={(value: number) => [
                                `¥${value.toLocaleString()}`,
                                '貯蓄額',
                            ]}
                        />
                        <Bar dataKey="surplus" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.surplus >= 0 ? '#10b981' : '#ef4444'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-800/50 p-3 text-center">
                    <p className="text-xs text-slate-400">最大貯蓄</p>
                    <p className="text-lg font-bold text-emerald-400">
                        ¥{Math.max(...data.map((d) => d.surplus)).toLocaleString()}
                    </p>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-3 text-center">
                    <p className="text-xs text-slate-400">平均貯蓄</p>
                    <p className="text-lg font-bold text-indigo-400">
                        ¥{Math.round(data.reduce((sum, d) => sum + d.surplus, 0) / data.length).toLocaleString()}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
