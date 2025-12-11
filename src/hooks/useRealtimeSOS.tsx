import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { djangoApi } from "@/lib/djangoApi";

interface SOSAlert {
  id: string;
  user_id: string;
  risk_level: number;
  latitude: number | null;
  longitude: number | null;
  resolved: boolean;
  created_at: string;
  source_character: string | null;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const useRealtimeSOS = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationWatching, setLocationWatching] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Subscribe to realtime SOS alerts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("sos-alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sos_alerts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("SOS Alert realtime update:", payload);
          if (payload.eventType === "INSERT") {
            setAlerts((prev) => [payload.new as SOSAlert, ...prev]);
            toast({
              title: "🚨 New SOS Alert",
              description: "An emergency alert has been triggered",
              variant: "destructive",
            });
          } else if (payload.eventType === "UPDATE") {
            setAlerts((prev) =>
              prev.map((a) =>
                a.id === (payload.new as SOSAlert).id ? (payload.new as SOSAlert) : a
              )
            );
          }
        }
      )
      .subscribe();

    // Fetch initial alerts
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from("sos_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setAlerts(data);
      }
    };

    fetchAlerts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Start watching location
  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setCurrentLocation(locationData);
        setLocationWatching(true);

        // Save location to database
        if (user) {
          supabase.from("user_locations").insert({
            user_id: user.id,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
          });
        }
      },
      (error) => {
        console.error("Location error:", error);
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, toast]);

  // Trigger SOS
  const triggerSOS = useCallback(
    async (sourceCharacter?: string, message?: string) => {
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to trigger SOS",
          variant: "destructive",
        });
        return null;
      }

      setIsTriggering(true);

      try {
        // Get current location
        let location: LocationData | undefined;
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 5000,
                });
              }
            );
            location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };
          } catch (e) {
            console.log("Could not get location:", e);
          }
        }

        // Create alert in Supabase
        const { data: alert, error } = await supabase
          .from("sos_alerts")
          .insert({
            user_id: user.id,
            risk_level: 10,
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
            source_character: sourceCharacter || null,
            resolved: false,
          })
          .select()
          .single();

        if (error) throw error;

        // Also try to notify Django backend (optional, for sync)
        try {
          await djangoApi.triggerSOS({
            user_id: user.id,
            message: message || "Emergency SOS triggered",
            risk_level: "critical",
            location: location,
            source_character: sourceCharacter,
          });
        } catch (e) {
          console.log("Django SOS sync failed (continuing with Supabase):", e);
        }

        // Call send-sos edge function
        await supabase.functions.invoke("send-sos", {
          body: {
            userId: user.id,
            riskLevel: 10,
            latitude: location?.latitude,
            longitude: location?.longitude,
            sourceCharacter: sourceCharacter,
          },
        });

        toast({
          title: "🚨 SOS Triggered",
          description: "Emergency contacts have been notified",
          variant: "destructive",
        });

        return alert;
      } catch (error) {
        console.error("SOS trigger error:", error);
        toast({
          title: "SOS Error",
          description: "Failed to trigger SOS alert",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsTriggering(false);
      }
    },
    [user, toast]
  );

  // Resolve alert
  const resolveAlert = useCallback(
    async (alertId: string) => {
      const { error } = await supabase
        .from("sos_alerts")
        .update({ resolved: true })
        .eq("id", alertId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to resolve alert",
          variant: "destructive",
        });
      } else {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
        );
        toast({
          title: "Alert Resolved",
          description: "The alert has been marked as resolved",
        });
      }
    },
    [toast]
  );

  return {
    alerts,
    currentLocation,
    locationWatching,
    isTriggering,
    startLocationWatch,
    triggerSOS,
    resolveAlert,
  };
};
