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
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <h3 className="mb-6 text-lg font-semibold text-slate-900">月別貯蓄額</h3>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="month"
                            tickFormatter={formatMonth}
                            stroke="#94a3b8"
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            stroke="#94a3b8"
                            fontSize={12}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                            labelFormatter={formatMonth}
                            formatter={(value: number | undefined) => [
                                `¥${(value ?? 0).toLocaleString()}`,
                                '貯蓄額',
                            ]}
                        />
                        <Bar dataKey="surplus" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.surplus >= 0 ? '#10b981' : '#f43f5e'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center">
                    <p className="text-xs text-slate-600">最大貯蓄</p>
                    <p className="text-lg font-bold text-emerald-600">
                        ¥{data.length > 0
                            ? Math.max(...data.map((d) => d.surplus ?? 0)).toLocaleString()
                            : '0'}
                    </p>
                </div>
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-center">
                    <p className="text-xs text-slate-600">平均貯蓄</p>
                    <p className="text-lg font-bold text-indigo-600">
                        ¥{data.length > 0
                            ? Math.round(data.reduce((sum, d) => sum + (d.surplus ?? 0), 0) / data.length).toLocaleString()
                            : '0'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
