"use client";

import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import type { AuditRecord } from "@/lib/api";

interface Props {
  records: AuditRecord[];
}

export default function AuditTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <ScrollText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">No audit records yet.</p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          Cancel a booking above to see the trigger in action.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest py-3 px-4">
              Booking ID
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest py-3 px-4">
              Action
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest py-3 px-4">
              Old Status
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest py-3 px-4">
              New Status
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest py-3 px-4">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, i) => (
            <motion.tr
              key={record.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-4 font-mono text-sm text-blue-400">
                #{record.booking_id}
              </td>
              <td className="py-3 px-4">
                <span className="text-xs font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-400">
                  {record.action}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-emerald-400">{record.old_status}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-red-400">{record.new_status}</span>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground font-mono">
                {new Date(record.changed_at).toLocaleString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
