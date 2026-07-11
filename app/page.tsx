import Hero from "@/components/hero";
import Timeline from "@/components/timeline";
import Faq from "@/components/faq";
import Footer from "@/components/footer";
import { connectToDatabase } from "@/lib/mongodb";
import TimelineEvent from "@/models/TimelineEvent";
import { seedTimelineEvents } from "@/app/admin/timeline-actions";

export default async function Home() {
  await connectToDatabase();
  await seedTimelineEvents();
  const timelineEvents = await TimelineEvent.find({}).sort({ order: 1 }).lean();
  
  // Convert _id to string for Client Components
  const serializedEvents = timelineEvents.map(e => ({
    ...e,
    _id: e._id.toString()
  }));

  return (
    <main className="min-h-screen w-full flex flex-col">
      <Hero />
      <Timeline initialTimelineData={serializedEvents as any} />
      <Faq />
      <Footer />
    </main>
  );
}