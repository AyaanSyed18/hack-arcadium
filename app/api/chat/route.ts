import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = rateLimit(ip, 15, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many messages sent. Please wait a minute and try again." }, { status: 429 });
    }

    const { messages } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku", // Can be adjusted as needed
        messages: [
          {
            role: "system",
            content: `You are the Arcadium Registration Bot. Ask exactly one question at a time to collect: Name, Email, Country (where they are applying from), Phone, Github (optional), LinkedIn (optional), Discord, and up to 3 Team Members (Name, Email, Phone). Do not ask for anything else.
When asking for the Phone number, ensure you prepend the correct country calling code based on their Country, and strictly validate that the length of the phone number is correct for that specific country. If the phone number length is invalid, kindly ask them to provide a valid phone number.
Once all data is collected, ask the user to confirm to submit. 
Upon confirmation, you MUST output the final data as a JSON block wrapped in <DATA> tags, like this:
<DATA>
{
  "name": "...",
  "email": "...",
  "country": "...",
  "phone": "...",
  "github": "...",
  "linkedin": "...",
  "discord": "...",
  "teamMembers": []
}
</DATA>`
          },
          ...messages
        ],
        stream: true,
        include_reasoning: true // Stream reasoning tokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter Error: ${response.statusText}`);
    }

    // Pass the stream directly back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
