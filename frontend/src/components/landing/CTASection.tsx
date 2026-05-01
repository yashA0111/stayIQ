"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.03] to-transparent" />
      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Experience the <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            See how StayIQ predicts cancellation risk and explains every decision
            with full transparency.
          </p>
          <Link
            href="/app/predict"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-xl hover:from-blue-500 hover:to-violet-500 transition-all duration-300 glow-blue hover:scale-[1.02] active:scale-[0.98]"
          >
            Try the Live Demo
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
