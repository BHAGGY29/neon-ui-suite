import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, prompt, category } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!lovableApiKey) throw new Error("AI service not available");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a creative character designer for a chat app. Generate a unique AI character.
Return ONLY a valid JSON object with these fields:
- name: A unique, memorable name (2-15 chars)
- personality: Personality traits description (1-2 sentences)
- backstory: A compelling backstory (2-3 sentences)
- gender: Male, Female, or Non-binary
- voice_type: One of: warm, cool, energetic, calm, mysterious, playful
- tags: Array of 3-5 relevant tags from: Anime, Realistic, Idol, Villain, Hero, Fantasy, Sci-Fi, Romance, Comedy, Drama, Original`
          },
          {
            role: "user",
            content: `Create a ${category || "original"} character based on: ${prompt || "a mysterious stranger with hidden depths"}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");

    const characterData = JSON.parse(jsonMatch[0]);

    const { data: character, error } = await supabase.from("characters").insert({
      user_id: userId,
      name: characterData.name,
      personality: characterData.personality,
      backstory: characterData.backstory,
      gender: characterData.gender,
      voice_type: characterData.voice_type,
      tags: Array.isArray(characterData.tags) ? characterData.tags : [category || "original"],
      is_public: false,
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, character }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Character generation error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
