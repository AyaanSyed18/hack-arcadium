import { connectToDatabase } from "@/lib/mongodb";
import TimelineEvent from "@/models/TimelineEvent";
import RegisterClient from "./client-page";
import { Lock } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  await connectToDatabase();
  
  // Assuming the first timeline event is the "Registration Opens" event
  const firstEvent = await TimelineEvent.findOne({}).sort({ order: 1 }).lean();
  
  const now = new Date();
  
  if (firstEvent && now < firstEvent.date) {
    // Registration hasn't opened yet
    return (
      <main className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center px-4">
        {/* Subtle radial glow */}
        <div className="pointer-events-none fixed inset-0 z-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.06), transparent)' }} />
        
        <div className="relative z-10 text-center max-w-md w-full bg-[#111111] border border-[#222222] rounded-3xl p-10 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Registration Locked</h2>
          <p className="text-[#8e8ea0] mb-8 leading-relaxed">
            Registration hasn't opened yet. The gates to Arcadium will unlock on:
          </p>
          <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-5 mb-8 flex flex-col items-center">
            <p className="text-xs text-[#8e8ea0] uppercase tracking-widest mb-2 font-semibold">Opening Date</p>
            <p className="text-emerald-400 text-xl font-bold tracking-wide">
              {new Date(firstEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-[#555] mt-1 text-sm">
              {new Date(firstEvent.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
            </p>
          </div>
          <Link
            href="/"
            className="inline-block bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors w-full"
          >
            Return to Timeline
          </Link>
        </div>
      </main>
    );
  }

  // Registration is open
  return <RegisterClient />;
}
