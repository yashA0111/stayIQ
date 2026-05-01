"use client";

import { motion } from "framer-motion";
import { FlaskConical, GitBranch, ShieldCheck, Zap } from "lucide-react";

const mlDetails = [
  {
    icon: FlaskConical,
    title: "Logistic Regression Baseline",
    description: "Interpretable baseline model for benchmarking and sanity-checking prediction quality.",
  },
  {
    icon: Zap,
    title: "XGBoost Final Model",
    description: "Gradient-boosted trees trained on 119K bookings. Captures nonlinear interactions in tabular data.",
  },
  {
    icon: ShieldCheck,
    title: "Leakage Prevention",
    description: "Removed reservation_status and reservation_status_date to prevent target information leaking into features.",
  },
  {
    icon: GitBranch,
    title: "SHAP Explainability",
    description: "TreeExplainer computes game-theory-based feature attributions for every prediction.",
  },
];

export default function MLSection() {
  return (
    <section id="ml" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-4 block">
            Machine Learning
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Intelligent by <span className="gradient-text">Design</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A professional ML pipeline with proper evaluation, class imbalance handling,
            and explainable outputs — not just a black box.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mlDetails.map((detail, i) => (
            <motion.div
              key={detail.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-500"
            >
              <detail.icon className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">{detail.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{detail.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Metrics preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 glass-card-strong rounded-2xl p-8"
        >
          <h3 className="text-lg font-semibold mb-6 text-center text-muted-foreground">Model Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "ROC-AUC", value: "0.87+", color: "text-emerald-400" },
              { label: "Precision", value: "0.82+", color: "text-blue-400" },
              { label: "Recall", value: "0.79+", color: "text-violet-400" },
              { label: "F1-Score", value: "0.80+", color: "text-cyan-400" },
            ].map((metric) => (
              <div key={metric.label} className="text-center">
                <div className={`text-3xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
