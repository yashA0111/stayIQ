"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { humanizeFeature } from "@/lib/api";
import type { SHAPFeature } from "@/lib/api";

interface Props {
  features: SHAPFeature[];
}

export default function SHAPChart({ features }: Props) {
  const maxAbsImpact = Math.max(...features.map((f) => f.abs_impact));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        Top Risk Drivers
      </h3>
      {features.map((feature, i) => {
        const isPositive = feature.impact > 0;
        const barWidth = (feature.abs_impact / maxAbsImpact) * 100;
        const color = isPositive ? "#ef4444" : "#10b981";

        return (
          <motion.div
            key={feature.feature}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            {/* Direction icon */}
            <div className="w-6 shrink-0">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-red-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              )}
            </div>

            {/* Label */}
            <div className="w-36 shrink-0 text-sm truncate">
              {humanizeFeature(feature.feature)}
            </div>

            {/* Bar */}
            <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                className="h-full rounded-lg"
                style={{
                  backgroundColor: `${color}30`,
                  borderRight: `3px solid ${color}`,
                }}
              />
            </div>

            {/* Value */}
            <div
              className="w-14 text-right text-sm font-mono font-semibold shrink-0"
              style={{ color }}
            >
              {isPositive ? "+" : ""}
              {feature.impact.toFixed(2)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
