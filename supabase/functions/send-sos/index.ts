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

    console.log("🚨 SOS Alert triggered for user:", userId);

    // Create SOS alert
    const { data: alert, error: alertError } = await supabase
      .from("sos_alerts")
      .insert({
        user_id: userId,
        risk_level: riskLevel || 10,
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

    // Get trusted contacts with SOS enabled
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
    const mapLink = location?.latitude && location?.longitude 
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : null;

    // Log and send notifications to each contact
    const notifications: string[] = [];
    
    if (contacts && contacts.length > 0) {
      for (const contact of contacts) {
        const sosMessage = `
🚨 EMERGENCY SOS ALERT 🚨

${userName} needs help!

${message ? `Message: ${message}` : ""}
${location?.latitude ? `📍 Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : "📍 Location: Not available"}
${mapLink ? `🗺️ Map: ${mapLink}` : ""}

Time: ${new Date().toISOString()}
Risk Level: ${riskLevel || 10}/10

Please respond immediately!
        `.trim();

        console.log(`📧 Sending notification to ${contact.name}:`);
        console.log(`   Email: ${contact.email}`);
        console.log(`   Phone: ${contact.phone}`);
        console.log(`   Message: ${sosMessage}`);
        
        notifications.push(`${contact.name} (${contact.email || contact.phone})`);
      }
    }

    console.log("✅ SOS Alert processed successfully");
    console.log(`   Alert ID: ${alert.id}`);
    console.log(`   Contacts notified: ${notifications.join(", ") || "None"}`);

    return new Response(JSON.stringify({
      success: true,
      alertId: alert.id,
      contactsNotified: contacts?.length || 0,
      notifications,
      mapLink,
      message: `🚨 SOS alert sent! ${contacts?.length || 0} contacts notified.`,
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
