"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { PredictionInput } from "@/lib/api";
import { DEFAULT_PREDICTION_INPUT, FORM_OPTIONS } from "@/lib/api";

interface Props {
  onSubmit: (data: PredictionInput) => void;
  loading: boolean;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, max, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">{label}</label>
      <input type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all" />
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <button type="button" onClick={() => onChange(value ? 0 : 1)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${value ? "bg-blue-500" : "bg-white/10"}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${value ? "translate-x-5.5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export default function PredictionForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<PredictionInput>({ ...DEFAULT_PREDICTION_INPUT });

  const set = <K extends keyof PredictionInput>(key: K, value: PredictionInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Booking Details */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Booking Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Hotel Type" value={form.hotel} options={FORM_OPTIONS.hotel} onChange={(v) => set("hotel", v)} />
          <NumberField label="Lead Time (days)" value={form.lead_time} onChange={(v) => set("lead_time", v)} max={800} />
          <NumberField label="Weekend Nights" value={form.stays_in_weekend_nights} onChange={(v) => set("stays_in_weekend_nights", v)} max={20} />
          <NumberField label="Weekday Nights" value={form.stays_in_week_nights} onChange={(v) => set("stays_in_week_nights", v)} max={50} />
          <SelectField label="Meal Plan" value={form.meal} options={FORM_OPTIONS.meal} onChange={(v) => set("meal", v)} />
          <SelectField label="Reserved Room" value={form.reserved_room_type} options={FORM_OPTIONS.reserved_room_type} onChange={(v) => set("reserved_room_type", v)} />
          <SelectField label="Assigned Room" value={form.assigned_room_type} options={FORM_OPTIONS.assigned_room_type} onChange={(v) => set("assigned_room_type", v)} />
          <NumberField label="Booking Changes" value={form.booking_changes} onChange={(v) => set("booking_changes", v)} max={20} />
        </div>
      </div>

      {/* Guest Information */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Guest Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Adults" value={form.adults} onChange={(v) => set("adults", v)} min={1} max={10} />
          <NumberField label="Children" value={form.children} onChange={(v) => set("children", v)} max={10} />
          <NumberField label="Babies" value={form.babies} onChange={(v) => set("babies", v)} max={5} />
          <SelectField label="Country" value={form.country} options={FORM_OPTIONS.country} onChange={(v) => set("country", v)} />
          <SelectField label="Customer Type" value={form.customer_type} options={FORM_OPTIONS.customer_type} onChange={(v) => set("customer_type", v)} />
          <NumberField label="Previous Cancellations" value={form.previous_cancellations} onChange={(v) => set("previous_cancellations", v)} max={30} />
          <NumberField label="Prev. Non-Canceled" value={form.previous_bookings_not_canceled} onChange={(v) => set("previous_bookings_not_canceled", v)} max={100} />
          <div className="col-span-2">
            <ToggleField label="Repeated Guest" value={form.is_repeated_guest} onChange={(v) => set("is_repeated_guest", v)} />
          </div>
        </div>
      </div>

      {/* Distribution & Financial */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Distribution & Financial</h3>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Market Segment" value={form.market_segment} options={FORM_OPTIONS.market_segment} onChange={(v) => set("market_segment", v)} />
          <SelectField label="Distribution Channel" value={form.distribution_channel} options={FORM_OPTIONS.distribution_channel} onChange={(v) => set("distribution_channel", v)} />
          <SelectField label="Deposit Type" value={form.deposit_type} options={FORM_OPTIONS.deposit_type} onChange={(v) => set("deposit_type", v)} />
          <NumberField label="Avg Daily Rate ($)" value={form.adr} onChange={(v) => set("adr", v)} step={0.01} />
          <NumberField label="Agent ID" value={form.agent} onChange={(v) => set("agent", v)} max={600} />
          <NumberField label="Waiting List (days)" value={form.days_in_waiting_list} onChange={(v) => set("days_in_waiting_list", v)} max={400} />
          <NumberField label="Parking Spaces" value={form.required_car_parking_spaces} onChange={(v) => set("required_car_parking_spaces", v)} max={8} />
          <NumberField label="Special Requests" value={form.total_of_special_requests} onChange={(v) => set("total_of_special_requests", v)} max={10} />
        </div>
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
        {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</>) : "Predict Cancellation Risk"}
      </button>
    </form>
  );
}
