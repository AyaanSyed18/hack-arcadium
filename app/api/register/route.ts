import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/models/Registration';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Server-side Validation
    if (!data.name || !data.email || !data.phone || !data.discord) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (data.teamMembers && data.teamMembers.length > 3) {
      return NextResponse.json({ error: "Maximum 3 team members allowed" }, { status: 400 });
    }

    await connectToDatabase();

    // Check for existing registration
    const existingRegistration = await Registration.findOne({ email: data.email });
    if (existingRegistration) {
      return NextResponse.json({ error: "This email has already been registered." }, { status: 409 });
    }

    const newRegistration = await Registration.create(data);

    return NextResponse.json({ 
      success: true, 
      registrationId: newRegistration._id.toString() 
    });

  } catch (error) {
    console.error("Database Save Error:", error);
    return NextResponse.json({ error: "Failed to save registration" }, { status: 500 });
  }
}
