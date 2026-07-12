import { connectToDatabase } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import TimelineEvent from "@/models/TimelineEvent";
import { seedTimelineEvents } from "@/app/admin/timeline-actions";
import { Users } from "lucide-react";
import TimelineManager from "@/components/timeline-manager";
import AdminUserList from "@/components/admin-user-list";
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

  // Convert MongoDB ObjectIds and Dates to string for Client Components
  const serializedRegistrations = JSON.parse(JSON.stringify(registrations));

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

        {/* User Search & Listing Component */}
        <AdminUserList initialUsers={serializedRegistrations} />

        {/* Timeline Manager Section */}
        <TimelineManager initialEvents={serializedEvents as any} />
      </div>
    </div>
  );
}
