import * as React from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060F1E] flex items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow — brand-matched warm tones */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0B1F33]/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#E07614]/6 blur-[100px] rounded-full pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[900px] min-h-[540px] flex rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5">

        {/* LEFT — Brand Panel */}
        <div className="hidden md:flex flex-col justify-between w-[42%] bg-[#0B1F33] p-10 border-r border-white/5">
          {/* Logo + name */}
          <div className="space-y-5">
            <div className="w-16 h-16 bg-white rounded-xl p-2.5 shadow-lg flex items-center justify-center">
              <Image
                src="/brand/latifal-star-logo.png"
                alt="LATIFAL STAR Logo"
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-[17px] leading-snug tracking-tight">
                <span className="text-[#3B82F6]">LATIFAL STAR</span>
                <br />
                <span className="text-[#E07614]">
                TECHNICAL SERVICES
                </span>
              </h1>
              <p className="text-slate-500 text-[11px] font-medium tracking-widest uppercase mt-2">
                Dubai • UAE
              </p>
            </div>
          </div>

          {/* Middle tagline */}
          <div className="space-y-4">
            <div className="w-8 h-0.5 bg-[#E07614] rounded-full" />
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              Enterprise Operations Platform
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Quotations · Invoices · Purchase Orders
              <br />
              Work Completion · Customer Management
            </p>
          </div>

          {/* Footer */}
          <p className="text-slate-600 text-[10px]">
            © 2026 Latifal Star Technical Services
          </p>
        </div>

        {/* RIGHT — Login Form */}
        <div className="flex-1 bg-white flex flex-col justify-center px-8 sm:px-12 py-12">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#0B1F33] rounded-lg p-1.5 flex items-center justify-center">
              <Image src="/brand/latifal-star-logo.png" alt="LATIFAL STAR" width={28} height={28} className="object-contain" />
            </div>
            <span className="font-bold text-[#0B1F33] text-sm tracking-tight">
              <span className="text-[#E07614]">LATIFAL STAR</span> ERP
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
