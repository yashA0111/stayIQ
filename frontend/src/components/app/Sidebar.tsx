"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Brain, ScrollText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/predict", label: "Predict", icon: Brain },
  { href: "/app/audit", label: "Audit Trail", icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-white/5 bg-sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 shrink-0">
            <Image src="/logo.png" alt="StayIQ Logo" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight">StayIQ</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 rounded-r-full bg-gradient-to-b from-blue-500 to-violet-500" />
              )}
              <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to home */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </aside>
  );
}
