import { connectToDatabase } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import TimelineEvent from "@/models/TimelineEvent";
import { seedTimelineEvents } from "@/app/admin/timeline-actions";
import { Users, Mail, MapPin, Phone, Link, MessageSquare, ShieldAlert } from "lucide-react";
import DeleteUserButton from "@/components/delete-user-button";
import TimelineManager from "@/components/timeline-manager";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== "authenticated") {
    redirect("/admin/login");
  }

  await connectToDatabase();
  await seedTimelineEvents();
  const registrations = await Registration.find({}).sort({ createdAt: -1 }).lean();
  const timelineEvents = await TimelineEvent.find({}).sort({ order: 1 }).lean();
  
  // Convert MongoDB ObjectIds to strings for Client Components
  const serializedEvents = timelineEvents.map(e => ({
    ...e,
    _id: e._id.toString()
  }));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 pt-24 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800/60 backdrop-blur-sm">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <Users className="h-8 w-8 text-indigo-400" />
              </div>
              Admin Dashboard
            </h1>
            <p className="mt-2 text-neutral-400 text-sm md:text-base">
              Manage and view all Arcadium registrations in real-time.
            </p>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 shadow-inner rounded-xl px-6 py-4 flex flex-col items-center justify-center min-w-[140px]">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Total Users</span>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-500">
              {registrations.length}
            </span>
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
              <div className="bg-neutral-900 p-4 rounded-full mb-4">
                <ShieldAlert className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Registrations Yet</h3>
              <p className="text-neutral-400 max-w-sm text-center">Once users complete the bot registration flow, their details will appear here.</p>
            </div>
          ) : (
            registrations.map((user: any) => (
              <div 
                key={user._id.toString()} 
                className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-neutral-700 transition-all duration-300 group flex flex-col h-full"
              >
                {/* User Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {user.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-400 mt-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="font-medium">{user.country || "Not specified"}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950/80 border border-neutral-800 px-2 py-1 rounded-md whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <DeleteUserButton id={user._id.toString()} />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mt-auto bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/40">
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Mail className="h-4 w-4 text-neutral-500 shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-white transition-colors truncate">{user.email}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Phone className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className="truncate">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <MessageSquare className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className="truncate font-medium">{user.discord}</span>
                  </div>
                </div>

                {/* Social Links */}
                {(user.github || user.linkedin) && (
                  <div className="flex items-center gap-4 pt-5 mt-5 border-t border-neutral-800/50">
                    {user.github && (
                      <a href={user.github} target="_blank" rel="noreferrer" className="bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg">
                        <Link className="h-3.5 w-3.5" /> GitHub
                      </a>
                    )}
                    {user.linkedin && (
                      <a href={user.linkedin} target="_blank" rel="noreferrer" className="bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] hover:text-[#00a0dc] flex items-center gap-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg">
                        <Link className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                    )}
                  </div>
                )}

                {/* Team Members */}
                {user.teamMembers && user.teamMembers.length > 0 && (
                  <div className="mt-5 bg-neutral-950/80 rounded-xl p-4 border border-neutral-800">
                    <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      Team Members <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded-full">{user.teamMembers.length}</span>
                    </h3>
                    <div className="space-y-3">
                      {user.teamMembers.map((member: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1 relative pl-3 border-l-2 border-neutral-800 hover:border-indigo-500/50 transition-colors">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-neutral-200">{member.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                              {member.phone}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500 truncate">{member.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Timeline Manager Section */}
        <TimelineManager initialEvents={serializedEvents as any} />
      </div>
    </div>
  );
}
