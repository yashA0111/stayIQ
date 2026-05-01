"use client";

import { motion } from "framer-motion";
import { Zap, ArrowDown, Database, ScrollText } from "lucide-react";

export default function TriggerExplainer() {
  const steps = [
    { icon: Database, label: "Cancel Booking", sub: "UPDATE bookings SET status = 'Canceled'", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Zap, label: "Trigger Fires", sub: "trg_booking_audit AFTER UPDATE", color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: ScrollText, label: "Audit Row Inserted", sub: "INSERT INTO booking_audit (auto)", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-strong rounded-2xl p-8"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-amber-500/10">
          <Zap className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold mb-1">How Database Triggers Work</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The audit trail is powered by a MySQL <span className="font-mono text-amber-300">AFTER UPDATE</span> trigger.
            When a booking status changes, the database <em>automatically</em> inserts an audit record —
            no application code writes to the audit table.
          </p>
        </div>
      </div>

      {/* Visual flow */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-xl ${step.bg} mb-2`}>
                <step.icon className={`w-5 h-5 ${step.color}`} />
              </div>
              <span className="text-sm font-semibold">{step.label}</span>
              <span className="text-xs text-muted-foreground font-mono mt-1">{step.sub}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowDown className="w-4 h-4 text-muted-foreground rotate-[-90deg] mx-2 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
