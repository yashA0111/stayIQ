"use client";

import { motion } from "framer-motion";
import { Database, FileCode2, History, Table2 } from "lucide-react";

const dbFeatures = [
  {
    icon: Table2,
    title: "Normalized Schema",
    description: "Relational design that eliminates redundancy and ensures referential integrity across all booking data.",
  },
  {
    icon: History,
    title: "Trigger-Based Audit",
    description: "MySQL trigger automatically records every status change — no application code writes to the audit table.",
    code: "CREATE TRIGGER trg_booking_audit\nAFTER UPDATE ON bookings\nFOR EACH ROW\nBEGIN\n  IF OLD.status != NEW.status THEN\n    INSERT INTO booking_audit\n      (booking_id, action, old_status, new_status)\n    VALUES (NEW.id, 'STATUS_CHANGE',\n      OLD.status, NEW.status);\n  END IF;\nEND;",
  },
  {
    icon: FileCode2,
    title: "Stored Procedures",
    description: "Encapsulated database operations like booking cancellation run server-side for consistency and security.",
  },
  {
    icon: Database,
    title: "Raw JDBC",
    description: "Java Spring Boot backend uses raw JDBC — no ORM abstraction. Direct SQL with PreparedStatements.",
  },
];

export default function DatabaseSection() {
  return (
    <section id="database" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4 block">
            Database Design
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Structured for <span className="gradient-text">Integrity</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every database feature is intentional — normalization, triggers, stored procedures,
            and audit logging demonstrate real DBMS understanding.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dbFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-500"
            >
              <feature.icon className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
              {feature.code && (
                <pre className="text-xs font-mono text-emerald-300/80 bg-black/30 rounded-xl p-4 overflow-x-auto leading-relaxed">
                  <code>{feature.code}</code>
                </pre>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
