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
    const { userId, message, riskLevel, location, sourceCharacter } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create SOS alert
    const { data: alert, error: alertError } = await supabase
      .from("sos_alerts")
      .insert({
        user_id: userId,
        risk_level: riskLevel,
        source_character: sourceCharacter,
        latitude: location?.latitude,
        longitude: location?.longitude,
      })
      .select()
      .single();

    if (alertError) {
      console.error("Error creating alert:", alertError);
      throw alertError;
    }

    // Save user location if provided
    if (location?.latitude && location?.longitude) {
      await supabase
        .from("user_locations")
        .insert({
          user_id: userId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        });
    }

    // Get trusted contacts
    const { data: contacts, error: contactsError } = await supabase
      .from("trusted_contacts")
      .select("*")
      .eq("user_id", userId)
      .eq("sos_enabled", true)
      .order("priority", { ascending: true });

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", userId)
      .maybeSingle();

    const userName = profile?.username || "A user";

    // Log the SOS event (in production, you'd send actual emails/SMS)
    console.log(`🚨 SOS ALERT from ${userName}`);
    console.log(`Risk Level: ${riskLevel}`);
    console.log(`Message: ${message}`);
    console.log(`Location: ${location?.latitude}, ${location?.longitude}`);
    console.log(`Contacts to notify: ${contacts?.map(c => c.name).join(", ")}`);

    return new Response(JSON.stringify({
      success: true,
      alertId: alert.id,
      contactsNotified: contacts?.length || 0,
      message: `SOS alert created. ${contacts?.length || 0} contacts will be notified.`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("SOS error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
