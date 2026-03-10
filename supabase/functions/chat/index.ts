import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CRITICAL_KEYWORDS = ['kill', 'suicide', 'die', 'murder', 'blood', 'weapon', 'gun'];
const DANGER_KEYWORDS = ['danger', 'scared', 'hurt', 'follow', 'stalk', 'beat', 'pain', 'threat'];
const DISTRESS_KEYWORDS = ['sad', 'stress', 'tired', 'lonely', 'depressed', 'anxious'];

function calculateRiskScore(message: string): number {
  const lower = message.toLowerCase();
  if (CRITICAL_KEYWORDS.some(w => lower.includes(w))) return 10;
  if (DANGER_KEYWORDS.some(w => lower.includes(w))) return 8;
  if (DISTRESS_KEYWORDS.some(w => lower.includes(w))) return 4;
  return 0;
}

function getSafetyResponse(riskScore: number): string | null {
  if (riskScore >= 10) return "🚨 CRITICAL THREAT DETECTED. I am initiating emergency protocols. Your safety is my priority.";
  if (riskScore >= 8) return "I sense you may be in danger. I am sending an alert to your trusted contacts now. Please stay safe.";
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, characterName, characterPersonality, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const riskScore = calculateRiskScore(message);
    const triggerAlert = riskScore >= 8;
    const safetyResponse = getSafetyResponse(riskScore);

    let botReply: string;

    if (safetyResponse) {
      botReply = safetyResponse;
    } else {
      const systemPrompt = `You are ${characterName || 'Mahika'}, an AI character in a chat app.
${characterPersonality ? `Your personality and traits: ${characterPersonality}.` : 'You are warm, caring, and engaging.'}
Stay fully in character at all times. Be creative, engaging, and emotionally intelligent.
Keep responses 1-4 sentences. Never break character or mention being an AI unless your character is an AI.
If the user seems distressed, offer gentle support while staying in character.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...(conversationHistory || []).slice(-10),
        { role: "user", content: message }
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      botReply = data.choices?.[0]?.message?.content || "I'm here for you. How can I help?";
    }

    return new Response(JSON.stringify({ status: "ok", botReply, riskScore, triggerAlert }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
      botReply: "I'm having trouble connecting. Please try again.",
      riskScore: 0, triggerAlert: false,
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
