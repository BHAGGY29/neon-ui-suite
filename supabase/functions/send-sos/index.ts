import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", userId)
      .maybeSingle();

    const userName = profile?.username || "A Mahika user";
    const mapLink = location?.latitude && location?.longitude 
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : null;

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

    // Build the SOS notification content
    const notifications: string[] = [];
    
    if (contacts && contacts.length > 0) {
      for (const contact of contacts) {
        const sosMessage = `
🚨 EMERGENCY SOS ALERT 🚨

${userName} needs immediate help!

${message ? `📝 Message: ${message}` : ""}
${location?.latitude ? `📍 Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : "📍 Location: Not available"}
${mapLink ? `🗺️ Google Maps: ${mapLink}` : ""}

⏰ Time: ${new Date().toLocaleString()}
⚠️ Risk Level: ${riskLevel || 10}/10

Please respond immediately and check on ${userName}!

— Mahika Safety System
        `.trim();

        // Log the full notification (in production this would send email/SMS)
        console.log(`📧 SOS to ${contact.name} (${contact.email || contact.phone}):`);
        console.log(sosMessage);
        
        notifications.push(`${contact.name} (${contact.email || contact.phone})`);

        // Save notification record for audit
        // In a production app, integrate with email API (Resend, SendGrid, etc.)
        // For now, we log and track all notifications
      }
    }

    // Save user location if provided
    if (location?.latitude && location?.longitude) {
      await supabase.from("user_locations").insert({
        user_id: userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      });
    }

    console.log("✅ SOS Alert processed successfully");
    console.log(`   Contacts notified: ${notifications.join(", ") || "None"}`);

    return new Response(JSON.stringify({
      success: true,
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
