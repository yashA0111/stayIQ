"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import RiskGauge from "./RiskGauge";
import SHAPChart from "./SHAPChart";
import type { PredictionResult } from "@/lib/api";

interface Props {
  result: PredictionResult | null;
  loading: boolean;
}

const riskIcons = {
  HIGH: ShieldAlert,
  MEDIUM: Shield,
  LOW: ShieldCheck,
};

export default function ResultCard({ result, loading }: Props) {
  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px]"
          >
            <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-4" />
            <p className="text-muted-foreground">Analyzing booking risk...</p>
            <p className="text-xs text-muted-foreground/50 mt-2">Running XGBoost + SHAP analysis</p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Risk gauge card */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex flex-col items-center">
                <RiskGauge
                  probability={result.probability}
                  risk={result.risk}
                  riskColor={result.risk_color}
                />

                {/* Risk badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: `${result.risk_color}15`,
                    border: `1px solid ${result.risk_color}30`,
                  }}
                >
                  {(() => {
                    const Icon = riskIcons[result.risk as keyof typeof riskIcons] || Shield;
                    return <Icon className="w-4 h-4" style={{ color: result.risk_color }} />;
                  })()}
                  <span className="text-sm font-semibold" style={{ color: result.risk_color }}>
                    {(result.probability * 100).toFixed(1)}% — {result.risk} RISK
                  </span>
                </motion.div>

                {/* Confidence */}
                <p className="text-xs text-muted-foreground mt-3">
                  Model confidence: {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* SHAP explanation card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-8"
            >
              <SHAPChart features={result.top_features} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
            <p className="text-muted-foreground max-w-xs">
              Fill in the booking details and click predict to see the cancellation risk
              analysis with SHAP explanations.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
