"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, X, Loader2, AlertCircle } from "lucide-react";
import type { BulkPredictionResult } from "@/lib/api";

interface Props {
  onResults: (results: BulkPredictionResult) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

// Columns to drop before sending to the model
const DROP_COLUMNS = ["is_canceled", "reservation_status", "reservation_status_date", "arrival_date_year", "arrival_date_month", "arrival_date_week_number", "arrival_date_day_of_month", "company"];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length !== headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      if (!DROP_COLUMNS.includes(h)) {
        row[h] = values[j];
      }
    });
    rows.push(row);
  }
  return rows;
}

export default function BulkUpload({ onResults, loading, setLoading }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const USE_MOCK = false;

  const processFile = useCallback(async (f: File) => {
    setError(null);
    setFile(f);

    const text = await f.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      setError("No valid rows found in the CSV file.");
      setFile(null);
      return;
    }

    setRowCount(rows.length);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.type === "text/csv")) {
      processFile(f);
    } else {
      setError("Please upload a CSV file.");
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 2000));

        // Generate mock bulk results
        const predictions = rows.slice(0, Math.min(rows.length, 500)).map((_, i) => {
          const prob = Math.random() * 0.9 + 0.05;
          const risk = prob >= 0.7 ? "HIGH" : prob >= 0.4 ? "MEDIUM" : "LOW";
          const riskColor = risk === "HIGH" ? "#ef4444" : risk === "MEDIUM" ? "#f59e0b" : "#10b981";
          return { row_index: i, probability: parseFloat(prob.toFixed(4)), risk, risk_color: riskColor };
        });

        const high = predictions.filter((p) => p.risk === "HIGH").length;
        const medium = predictions.filter((p) => p.risk === "MEDIUM").length;
        const low = predictions.filter((p) => p.risk === "LOW").length;

        onResults({
          summary: {
            total_rows: predictions.length,
            high_risk_count: high,
            medium_risk_count: medium,
            low_risk_count: low,
            high_risk_percentage: parseFloat(((high / predictions.length) * 100).toFixed(1)),
            average_probability: parseFloat((predictions.reduce((a, p) => a + p.probability, 0) / predictions.length).toFixed(4)),
          },
          predictions,
          feature_importance: [
            { feature: "deposit_type", importance: 0.28 },
            { feature: "lead_time", importance: 0.19 },
            { feature: "previous_cancellations", importance: 0.14 },
            { feature: "adr", importance: 0.09 },
            { feature: "country", importance: 0.07 },
            { feature: "market_segment", importance: 0.06 },
            { feature: "total_of_special_requests", importance: 0.05 },
            { feature: "is_repeated_guest", importance: 0.04 },
          ],
          risk_distribution: [
            { name: "Low Risk", value: low, color: "#10b981" },
            { name: "Medium Risk", value: medium, color: "#f59e0b" },
            { name: "High Risk", value: high, color: "#ef4444" },
          ],
        });
      } else {
        const { predictBatch } = await import("@/lib/api");
        const result = await predictBatch(rows);
        onResults(result);
      }
    } catch {
      setError("Prediction failed. Please check the file format.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setRowCount(0);
    setError(null);
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`glass-card rounded-2xl p-12 text-center border-2 border-dashed transition-all duration-300 cursor-pointer ${
            dragActive ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20"
          }`}
        >
          <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? "text-blue-400" : "text-muted-foreground"}`} />
            <h3 className="text-lg font-semibold mb-2">Drop your CSV file here</h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <p className="text-xs text-muted-foreground/60">
              Use the Kaggle Hotel Booking Demand dataset format. Columns like reservation_status will be auto-dropped.
            </p>
          </label>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {rowCount.toLocaleString()} rows · {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
            <button onClick={clearFile} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Predict button */}
      {file && (
        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Analyzing {rowCount.toLocaleString()} bookings...</>
          ) : (
            <>Run Bulk Prediction on {rowCount.toLocaleString()} Rows</>
          )}
        </button>
      )}
    </div>
  );
}
