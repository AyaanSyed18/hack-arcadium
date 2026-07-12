import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { rateLimit } from '@/lib/rate-limit';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = rateLimit(ip, 5, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many registration attempts. Please wait a minute and try again." }, { status: 429 });
    }

    const data = await req.json();
    
    // Server-side Validation
    if (!data.name || !data.email || !data.country || !data.phone || !data.discord) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (data.teamMembers && data.teamMembers.length > 3) {
      return NextResponse.json({ error: "Maximum 3 team members allowed" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify registration is open
    const { default: TimelineEvent } = await import('@/models/TimelineEvent');
    const firstEvent = await TimelineEvent.findOne({}).sort({ order: 1 }).lean();
    if (firstEvent && new Date() < new Date(firstEvent.date)) {
      return NextResponse.json({ error: "Registration is not open yet." }, { status: 403 });
    }

    // Check for existing registration
    const existingRegistration = await Registration.findOne({ email: data.email });
    if (existingRegistration) {
      return NextResponse.json({ error: "This email has already been registered." }, { status: 409 });
    }

    const newRegistration = await Registration.create(data);

    // Asynchronously send WhatsApp invite message without blocking the API response
    sendWhatsAppMessage(newRegistration.phone, newRegistration.name)
      .then(async (success) => {
        if (success) {
          await Registration.updateOne({ _id: newRegistration._id }, { whatsappInviteSent: true });
          console.log(`✅ Serverless WhatsApp invite sent and tracked for ${newRegistration.name}`);
        } else {
          console.warn(`⚠️ Failed to send WhatsApp invite to ${newRegistration.name} via API`);
        }
      })
      .catch((err) => {
        console.error(`❌ Error in async WhatsApp invite dispatch:`, err);
      });

    return NextResponse.json({ 
      success: true, 
      registrationId: newRegistration._id.toString() 
    });

  } catch (error) {
    console.error("Database Save Error:", error);
    return NextResponse.json({ error: "Failed to save registration" }, { status: 500 });
  }
}
