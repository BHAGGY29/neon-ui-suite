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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get total users count
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get total SOS alerts
    const { count: totalSOS } = await supabase
      .from("sos_alerts")
      .select("*", { count: "exact", head: true });

    // Get total messages
    const { count: totalMessages } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true });

    // Get high risk alerts (risk_level >= 8)
    const { count: highRiskAlerts } = await supabase
      .from("sos_alerts")
      .select("*", { count: "exact", head: true })
      .gte("risk_level", 8);

    // Get total characters
    const { count: totalCharacters } = await supabase
      .from("characters")
      .select("*", { count: "exact", head: true });

    // Get recent alerts
    const { data: recentAlerts } = await supabase
      .from("sos_alerts")
      .select(`
        id,
        risk_level,
        source_character,
        resolved,
        created_at,
        latitude,
        longitude
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    console.log("Admin stats fetched successfully");

    return new Response(JSON.stringify({
      totalUsers: totalUsers || 0,
      totalSOS: totalSOS || 0,
      totalMessages: totalMessages || 0,
      highRiskAlerts: highRiskAlerts || 0,
      totalCharacters: totalCharacters || 0,
      recentAlerts: recentAlerts || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
