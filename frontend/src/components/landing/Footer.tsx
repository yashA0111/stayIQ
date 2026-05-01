import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <Image src="/logo.png" alt="StayIQ Logo" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-lg tracking-tight">StayIQ</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 StayIQ. Built with intelligence.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded bg-white/5 font-mono">Next.js</span>
          <span className="px-2 py-1 rounded bg-white/5 font-mono">Flask</span>
          <span className="px-2 py-1 rounded bg-white/5 font-mono">XGBoost</span>
          <span className="px-2 py-1 rounded bg-white/5 font-mono">MySQL</span>
        </div>
      </div>
    </footer>
  );
}
