"use client";

import { motion } from "framer-motion";
import { Database, BrainCircuit, BarChart3, Eye, Layout, Server } from "lucide-react";

const steps = [
  { icon: Database, label: "Booking Data", sub: "119K+ records ingested", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { icon: Server, label: "MySQL Database", sub: "Normalized schema + triggers", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { icon: BrainCircuit, label: "ML Pipeline", sub: "XGBoost gradient boosting", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  { icon: BarChart3, label: "Prediction Engine", sub: "Real-time risk scoring", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  { icon: Eye, label: "SHAP Explainability", sub: "Feature attribution analysis", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { icon: Layout, label: "Dashboard Intelligence", sub: "Actionable visual insights", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30" },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4 block">
            System Architecture
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            End-to-End <span className="gradient-text">Intelligence Pipeline</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From raw booking data to actionable predictions — every layer is designed
            for reliability, explainability, and speed.
          </p>
        </motion.div>

        {/* Architecture flow */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`flex items-center gap-6 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Content card */}
                <div className={`flex-1 glass-card rounded-2xl p-6 border ${step.border}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${step.bg}`}>
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{step.label}</h3>
                      <p className="text-sm text-muted-foreground">{step.sub}</p>
                    </div>
                  </div>
                </div>

                {/* Center dot */}
                <div className={`relative z-10 w-4 h-4 rounded-full ${step.bg} border-2 ${step.border} shrink-0`}>
                  <div className={`absolute inset-0 rounded-full ${step.bg} animate-pulse-glow`} />
                </div>

                {/* Spacer */}
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
