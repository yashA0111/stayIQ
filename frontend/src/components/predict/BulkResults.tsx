"use client";

import { motion } from "framer-motion";
import { BarChart3, AlertTriangle, ShieldCheck, Shield, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { humanizeFeature } from "@/lib/api";
import type { BulkPredictionResult } from "@/lib/api";

interface Props {
  results: BulkPredictionResult;
}

export default function BulkResults({ results }: Props) {
  const { summary, predictions, feature_importance, risk_distribution } = results;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Analyzed", value: summary.total_rows.toLocaleString(), icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "High Risk", value: summary.high_risk_count.toLocaleString(), icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Medium Risk", value: summary.medium_risk_count.toLocaleString(), icon: Shield, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Low Risk", value: summary.low_risk_count.toLocaleString(), icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk distribution pie */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Risk Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {risk_distribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(220,15%,12%)", border: "1px solid hsl(220,15%,20%)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {risk_distribution.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature importance bar chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Feature Importance (SHAP)</span>
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feature_importance.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="feature" tick={{ fill: "#999", fontSize: 11 }} axisLine={false} tickLine={false} width={110} tickFormatter={(v: string) => humanizeFeature(v)} />
                <Tooltip
                  contentStyle={{ background: "hsl(220,15%,12%)", border: "1px solid hsl(220,15%,20%)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: any) => [Number(value).toFixed(3), "Importance"]}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]} fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Predictions table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Predictions ({predictions.length.toLocaleString()} rows)
          </h3>
          <span className="text-xs text-muted-foreground">
            Avg probability: {(summary.average_probability * 100).toFixed(1)}%
          </span>
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest py-2 px-3">Row</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest py-2 px-3">Probability</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest py-2 px-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 100).map((pred) => (
                <tr key={pred.row_index} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-sm font-mono text-muted-foreground">#{pred.row_index + 1}</td>
                  <td className="py-2 px-3 text-sm font-mono">{(pred.probability * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${pred.risk_color}15`, color: pred.risk_color }}>
                      {pred.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {predictions.length > 100 && (
            <p className="text-xs text-muted-foreground text-center py-3">Showing first 100 of {predictions.length.toLocaleString()} rows</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
