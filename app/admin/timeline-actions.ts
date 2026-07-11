"use server"

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import TimelineEvent from "@/models/TimelineEvent";

const initialTimelineData = [
  {
    dateStr: 'July 6',
    date: new Date('2026-07-06T00:00:00'),
    title: 'Registration Opens',
    description: 'Secure your spot in the digital arena. Teams of up to 4.',
    order: 1,
  },
  {
    dateStr: 'July 16',
    date: new Date('2026-07-16T00:00:00'),
    title: 'The Hack Begins',
    description: 'Virtual opening ceremony, team formation, and hacking commences.',
    order: 2,
  },
  {
    dateStr: 'July 23',
    date: new Date('2026-07-23T00:00:00'),
    title: 'Submission Deadline',
    description: 'Devpost submissions close. Code freeze initiated.',
    order: 3,
  },
  {
    dateStr: 'July 30',
    date: new Date('2026-07-30T00:00:00'),
    title: 'Winners Announced',
    description: '',
    order: 4,
  },
];

export async function seedTimelineEvents() {
  await connectToDatabase();
  const count = await TimelineEvent.countDocuments();
  if (count === 0) {
    await TimelineEvent.insertMany(initialTimelineData);
  }
}

export async function updateTimelineEvent(id: string, data: any) {
  try {
    await connectToDatabase();
    await TimelineEvent.findByIdAndUpdate(id, data);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update timeline event:", error);
    return { success: false, error: "Failed to update timeline event" };
  }
}

export async function addTimelineEvent(data: any) {
  try {
    await connectToDatabase();
    // Get highest order
    const lastEvent = await TimelineEvent.findOne().sort({ order: -1 });
    const nextOrder = lastEvent ? lastEvent.order + 1 : 1;
    
    await TimelineEvent.create({ ...data, order: nextOrder });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to add timeline event:", error);
    return { success: false, error: "Failed to add timeline event" };
  }
}

export async function deleteTimelineEvent(id: string) {
  try {
    await connectToDatabase();
    await TimelineEvent.findByIdAndDelete(id);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete timeline event:", error);
    return { success: false, error: "Failed to delete timeline event" };
  }
}
