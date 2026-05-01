"use client";

import { motion } from "framer-motion";

interface Props {
  probability: number;
  risk: string;
  riskColor: string;
}

export default function RiskGauge({ probability, risk, riskColor }: Props) {
  const percentage = probability * 100;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[135deg]">
          {/* Background arc */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            className="text-white/5"
          />
          {/* Animated progress arc */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={riskColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 12px ${riskColor}80)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-4xl font-bold"
            style={{ color: riskColor }}
          >
            {percentage.toFixed(0)}%
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="text-xs font-semibold uppercase tracking-widest mt-1"
            style={{ color: riskColor }}
          >
            {risk} Risk
          </motion.div>
        </div>
      </div>

      {/* Glow effect under gauge */}
      <div
        className="w-32 h-4 rounded-full blur-xl mt-2"
        style={{ backgroundColor: `${riskColor}30` }}
      />
    </div>
  );
}
