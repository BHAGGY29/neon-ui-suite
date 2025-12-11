import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, prompt, category } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🎭 Generating character for user:", userId);
    console.log("   Prompt:", prompt);
    console.log("   Category:", category);

    let characterData: any;

    if (lovableApiKey) {
      // Use AI to generate character
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a creative character designer. Generate a unique AI character based on the user's prompt. 
              Return ONLY a valid JSON object with these fields:
              - name: A unique, memorable name
              - personality: Personality traits (comma-separated)
              - backstory: A compelling backstory (2-3 sentences)
              - gender: Male, Female, or Non-binary
              - voice_type: One of: warm, cool, energetic, calm, mysterious, playful
              - tags: An array of relevant tags (3-5 tags)`
            },
            {
              role: "user",
              content: `Create a ${category || "original"} character based on: ${prompt || "a mysterious stranger with hidden depths"}`
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.log("AI generation failed, using fallback");
        throw new Error("AI generation failed");
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        characterData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    } else {
      // Fallback: Generate without AI
      const names = ["Nova", "Cipher", "Echo", "Phantom", "Blaze", "Luna", "Storm", "Vex", "Nyx", "Zephyr"];
      const personalities = ["mysterious", "friendly", "brave", "cunning", "wise", "playful", "dark", "noble"];
      const backstories = [
        "A wanderer from the digital realm seeking connection.",
        "Once a guardian, now searching for redemption.",
        "Born in the neon streets, they carry secrets untold.",
        "A legendary figure whispered about in cyber cafes.",
      ];
      
      characterData = {
        name: names[Math.floor(Math.random() * names.length)] + "-" + Math.floor(Math.random() * 999),
        personality: personalities.slice(0, 3).join(", "),
        backstory: backstories[Math.floor(Math.random() * backstories.length)],
        gender: ["Male", "Female", "Non-binary"][Math.floor(Math.random() * 3)],
        voice_type: ["warm", "cool", "energetic", "mysterious"][Math.floor(Math.random() * 4)],
        tags: [category || "original", "ai-generated", "custom"],
      };
    }

    console.log("Generated character data:", characterData);

    // Save to database
    const { data: character, error } = await supabase
      .from("characters")
      .insert({
        user_id: userId,
        name: characterData.name,
        personality: characterData.personality,
        backstory: characterData.backstory,
        gender: characterData.gender,
        voice_type: characterData.voice_type,
        tags: Array.isArray(characterData.tags) ? characterData.tags : [category || "original"],
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving character:", error);
      throw error;
    }

    console.log("✅ Character created:", character.id);

    return new Response(JSON.stringify({
      success: true,
      character,
      message: `Character "${characterData.name}" created successfully!`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Character generation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
