"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#070b12] text-white p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-extrabold text-emerald-400">404</h1>
        <h2 className="text-xl font-bold">Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested page could not be located in NexusBiz AI.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md mt-4"
        >
          <Home size={14} />
          <span>Return to Executive Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
