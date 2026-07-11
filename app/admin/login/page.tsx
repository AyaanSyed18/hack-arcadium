"use client"

import { useState } from "react";
import { loginAdmin } from "../actions";
import { Lock, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdmin(pin);
      if (res.success) {
        window.location.href = "/admin";
      } else {
        setError(res.error || "Incorrect PIN");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center px-4 font-sans">
      {/* Subtle radial glow */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.06), transparent)' }} />

      <div className="relative z-10 max-w-md w-full bg-[#111111] border border-[#222222] rounded-3xl p-10 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6 text-indigo-400">
          <Lock className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-tight">Admin Authentication</h2>
        <p className="text-[#8e8ea0] text-center text-sm mb-8 leading-relaxed">
          Please enter the secure PIN to access the registrations dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <input
              type="password"
              required
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-[#0a0a0a] border border-[#252525] rounded-2xl px-4 py-4 text-center text-white text-2xl tracking-[0.5em] font-mono placeholder-neutral-700 focus:outline-none focus:border-indigo-500/60 transition-colors"
              autoFocus
              maxLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-4 rounded-2xl text-[15px] hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Authenticating…" : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
