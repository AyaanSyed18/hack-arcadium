import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
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
            content: `You are the Arcadium Registration Bot. Ask exactly one question at a time to collect: Name, Email, Phone, Github (optional), LinkedIn (optional), Discord, and up to 3 Team Members (Name, Role, Email). Do not ask for anything else. Once collected, ask the user to confirm to submit. 
Upon confirmation, you MUST output the final data as a JSON block wrapped in <DATA> tags, like this:
<DATA>
{
  "name": "...",
  "email": "...",
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
