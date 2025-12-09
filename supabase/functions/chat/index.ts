import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Risk keywords for safety scoring
const CRITICAL_KEYWORDS = ['kill', 'suicide', 'die', 'murder', 'blood', 'weapon', 'gun'];
const DANGER_KEYWORDS = ['danger', 'scared', 'hurt', 'follow', 'stalk', 'beat', 'pain', 'threat'];
const DISTRESS_KEYWORDS = ['sad', 'stress', 'tired', 'lonely', 'depressed', 'anxious'];

function calculateRiskScore(message: string): number {
  const lowerMessage = message.toLowerCase();
  
  if (CRITICAL_KEYWORDS.some(word => lowerMessage.includes(word))) {
    return 10;
  }
  if (DANGER_KEYWORDS.some(word => lowerMessage.includes(word))) {
    return 8;
  }
  if (DISTRESS_KEYWORDS.some(word => lowerMessage.includes(word))) {
    return 4;
  }
  return 0;
}

function getSafetyResponse(riskScore: number, userName: string): string | null {
  if (riskScore >= 10) {
    return "🚨 CRITICAL THREAT DETECTED. I am initiating emergency protocols. Please stay on the line. Your safety is my priority.";
  }
  if (riskScore >= 8) {
    return `${userName}, I sense you may be in danger. I am sending an alert to your trusted contacts now. Please stay safe.`;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, characterName, characterPersonality, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate risk score
    const riskScore = calculateRiskScore(message);
    const triggerAlert = riskScore >= 8;
    
    // Check for safety response first
    const safetyResponse = getSafetyResponse(riskScore, "Friend");
    
    let botReply: string;
    
    if (safetyResponse) {
      botReply = safetyResponse;
    } else {
      // Build conversation context
      const systemPrompt = `You are ${characterName || 'Mahika'}, a helpful, protective, and empathetic AI companion. 
${characterPersonality ? `Your personality: ${characterPersonality}` : 'You are warm, caring, and always prioritize user safety.'}
You provide thoughtful, engaging responses while being mindful of the user's emotional state.
Keep responses concise (1-3 sentences) but meaningful.
If the user seems distressed, offer gentle support and safety advice.`;

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
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      botReply = data.choices?.[0]?.message?.content || "I'm here for you. How can I help?";
    }

    console.log(`Chat processed - Risk Score: ${riskScore}, Alert: ${triggerAlert}`);

    return new Response(JSON.stringify({
      status: "ok",
      botReply,
      riskScore,
      triggerAlert,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      botReply: "I'm having trouble connecting, but I'm still here for you. How can I help?",
      riskScore: 0,
      triggerAlert: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
