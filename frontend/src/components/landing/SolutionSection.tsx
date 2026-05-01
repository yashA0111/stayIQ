"use client";

import { motion } from "framer-motion";
import { Brain, LineChart, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Predict",
    description: "XGBoost model trained on 119K+ bookings predicts cancellation probability with high accuracy.",
    accent: "from-blue-500 to-blue-600",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    icon: LineChart,
    title: "Explain",
    description: "SHAP explainability surfaces the exact factors driving each prediction — not just a score.",
    accent: "from-violet-500 to-violet-600",
    glow: "group-hover:shadow-violet-500/20",
  },
  {
    icon: Shield,
    title: "Act",
    description: "Armed with risk intelligence, hotels can intervene early — securing revenue before it's lost.",
    accent: "from-cyan-500 to-cyan-600",
    glow: "group-hover:shadow-cyan-500/20",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function SolutionSection() {
  return (
    <section className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4 block">
            The Solution
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Intelligence That <span className="gradient-text">Prevents Loss</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            StayIQ transforms raw booking data into predictive intelligence — giving hotels
            the foresight to act before cancellations happen.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className={`group glass-card rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-500 hover:shadow-2xl ${feature.glow}`}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.accent} mb-6`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
