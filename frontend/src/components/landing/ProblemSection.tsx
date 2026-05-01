"use client";

import { motion } from "framer-motion";
import { TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";

const stats = [
  {
    icon: TrendingDown,
    value: "40%",
    label: "Average Cancellation Rate",
    description: "Nearly half of all hotel bookings are canceled, destroying revenue forecasts.",
    color: "text-red-400",
    glow: "bg-red-500/10",
  },
  {
    icon: AlertTriangle,
    value: "$125B+",
    label: "Annual Revenue Lost",
    description: "The global hotel industry loses over $125 billion annually to cancellations.",
    color: "text-amber-400",
    glow: "bg-amber-500/10",
  },
  {
    icon: BarChart3,
    value: "72hrs",
    label: "Too Late to React",
    description: "Most cancellations happen within 72 hours, leaving no time for recovery.",
    color: "text-orange-400",
    glow: "bg-orange-500/10",
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

export default function ProblemSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-4 block">
            The Problem
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Hotels Are Losing Revenue <span className="gradient-text">Every Day</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unpredictable cancellations create cascading failures across occupancy planning,
            staffing, and revenue forecasting.
          </p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="group relative glass-card rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-500"
            >
              <div className={`absolute inset-0 rounded-2xl ${stat.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
              <div className="relative">
                <stat.icon className={`w-10 h-10 ${stat.color} mb-6`} />
                <div className={`text-5xl font-bold ${stat.color} mb-3`}>
                  {stat.value}
                </div>
                <h3 className="text-xl font-semibold mb-2">{stat.label}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
