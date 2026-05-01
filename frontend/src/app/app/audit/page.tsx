"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Database, XCircle } from "lucide-react";
import AuditTable from "@/components/audit/AuditTable";
import TriggerExplainer from "@/components/audit/TriggerExplainer";
import { MOCK_BOOKINGS, MOCK_AUDIT } from "@/lib/api";
import type { AuditRecord, Booking } from "@/lib/api";

const USE_MOCK = true;

export default function AuditPage() {
  const [audit, setAudit] = useState<AuditRecord[]>(MOCK_AUDIT);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter((b) => !b.is_canceled));
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!USE_MOCK) {
      const loadData = async () => {
        try {
          const { getBookings, getAuditTrail } = await import("@/lib/api");
          const [bData, aData] = await Promise.all([getBookings(), getAuditTrail()]);
          // API returns { bookings: [...] } and { audit_logs: [...] }
          // Let's handle if it returns directly an array or wrapped in an object
          setBookings(Array.isArray(bData) ? bData : (bData as any).bookings || []);
          setAudit(Array.isArray(aData) ? aData : (aData as any).audit_logs || []);
        } catch (e) {
          console.error("Failed to load initial data", e);
        }
      };
      loadData();
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
    } else {
      try {
        const { getAuditTrail } = await import("@/lib/api");
        const data = await getAuditTrail();
        setAudit(data);
      } catch {
        console.error("Failed to refresh");
      }
    }
    setRefreshing(false);
  };

  const handleCancel = async (bookingId: number) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      // Update booking status
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Canceled", is_canceled: 1 } : b
        )
      );
      // Add new audit record (simulating trigger)
      const newAudit: AuditRecord = {
        id: audit.length + 1,
        booking_id: bookingId,
        action: "STATUS_CHANGE",
        old_status: "Confirmed",
        new_status: "Canceled",
        changed_at: new Date().toISOString(),
      };
      setAudit((prev) => [newAudit, ...prev]);
      } else {
      try {
        const { cancelBooking, getAuditTrail } = await import("@/lib/api");
        await cancelBooking(bookingId);
        
        // Update local state to show it was canceled
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "Canceled", is_canceled: 1 } : b
          )
        );
        
        const data = await getAuditTrail();
        setAudit(Array.isArray(data) ? data : (data as any).audit_logs || []);
      } catch {
        console.error("Failed to cancel");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Audit Trail</h1>
        <p className="text-muted-foreground">
          Database trigger automatically records every booking status change.
        </p>
      </div>

      {/* Trigger explainer */}
      <TriggerExplainer />

      {/* Active bookings - cancel to demo trigger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Active Bookings</h2>
          </div>
          <span className="text-xs text-muted-foreground">Cancel a booking to trigger an audit record</span>
        </div>

        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-muted-foreground">#{booking.id}</span>
                <span className="text-sm font-medium">{booking.hotel}</span>
                <span className="text-xs text-muted-foreground">ADR ${booking.adr}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  booking.status === "Canceled"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {booking.status}
                </span>
              </div>
              {booking.status !== "Canceled" && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Audit records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Audit Records</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <AuditTable records={audit} />
      </motion.div>
    </div>
  );
}
