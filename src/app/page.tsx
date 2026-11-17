"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002664] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">
          Loading <span className="text-[#3B82F6]">LATIFAL STAR</span> <span className="text-[#60A5FA]">ERP</span>...
        </p>
      </div>
    </div>
  );
}
