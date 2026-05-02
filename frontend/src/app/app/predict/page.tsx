"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, FileSpreadsheet } from "lucide-react";
import PredictionForm from "@/components/predict/PredictionForm";
import ResultCard from "@/components/predict/ResultCard";
import BulkUpload from "@/components/predict/BulkUpload";
import BulkResults from "@/components/predict/BulkResults";
import type { PredictionInput, PredictionResult, BulkPredictionResult } from "@/lib/api";
import { MOCK_PREDICTION } from "@/lib/api";

const USE_MOCK = false;

type Tab = "single" | "bulk";

export default function PredictPage() {
  const [tab, setTab] = useState<Tab>("bulk");
  const [singleResult, setSingleResult] = useState<PredictionResult | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSinglePredict = async (data: PredictionInput) => {
    setLoading(true);
    setSingleResult(null);

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1500));
        const riskScore = Math.min(0.99, Math.max(0.05,
          0.15 +
          (data.lead_time > 100 ? 0.15 : 0) +
          (data.deposit_type === "No Deposit" ? 0.2 : -0.1) +
          (data.previous_cancellations > 0 ? 0.2 : 0) +
          (data.is_repeated_guest ? -0.15 : 0.05) +
          (data.total_of_special_requests > 2 ? -0.1 : 0.05) +
          (data.days_in_waiting_list > 0 ? 0.1 : 0) +
          (Math.random() * 0.1 - 0.05)
        ));
        const risk = riskScore >= 0.7 ? "HIGH" : riskScore >= 0.4 ? "MEDIUM" : "LOW";
        const riskColor = risk === "HIGH" ? "#ef4444" : risk === "MEDIUM" ? "#f59e0b" : "#10b981";

        setSingleResult({
          ...MOCK_PREDICTION,
          probability: parseFloat(riskScore.toFixed(4)),
          risk,
          risk_color: riskColor,
          confidence: parseFloat(Math.max(riskScore, 1 - riskScore).toFixed(4)),
          top_features: [
            { feature: "deposit_type", impact: data.deposit_type === "No Deposit" ? 0.31 : -0.12, abs_impact: 0.31, direction: data.deposit_type === "No Deposit" ? "up" : "down" },
            { feature: "lead_time", impact: data.lead_time > 100 ? 0.22 : -0.05, abs_impact: 0.22, direction: data.lead_time > 100 ? "up" : "down" },
            { feature: "previous_cancellations", impact: data.previous_cancellations > 0 ? 0.18 : -0.02, abs_impact: 0.18, direction: data.previous_cancellations > 0 ? "up" : "down" },
            { feature: "total_of_special_requests", impact: -0.12, abs_impact: 0.12, direction: "down" },
            { feature: "is_repeated_guest", impact: data.is_repeated_guest ? -0.09 : 0.04, abs_impact: 0.09, direction: data.is_repeated_guest ? "down" : "up" },
            { feature: "adr", impact: data.adr > 150 ? 0.07 : -0.03, abs_impact: 0.07, direction: data.adr > 150 ? "up" : "down" },
            { feature: "market_segment", impact: 0.05, abs_impact: 0.05, direction: "up" },
            { feature: "days_in_waiting_list", impact: data.days_in_waiting_list > 0 ? 0.04 : 0.01, abs_impact: 0.04, direction: "up" },
          ],
        });
      } else {
        const { predict } = await import("@/lib/api");
        const res = await predict(data);
        setSingleResult(res);
      }
    } catch {
      console.error("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cancellation Prediction</h1>
        <p className="text-muted-foreground">
          Predict cancellation risk for individual bookings or analyze an entire dataset via CSV upload.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {([
          { key: "bulk" as Tab, label: "Bulk Prediction (CSV)", icon: FileSpreadsheet },
          { key: "single" as Tab, label: "Single Booking", icon: User },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setBulkResult(null); setSingleResult(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? "bg-gradient-to-r from-blue-600/20 to-violet-600/20 text-foreground border border-blue-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tab === "bulk" ? (
          <div className="space-y-8">
            <BulkUpload onResults={setBulkResult} loading={loading} setLoading={setLoading} />
            {bulkResult && <BulkResults results={bulkResult} />}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PredictionForm onSubmit={handleSinglePredict} loading={loading} />
            <ResultCard result={singleResult} loading={loading} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
