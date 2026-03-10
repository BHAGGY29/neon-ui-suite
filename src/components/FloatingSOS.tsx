import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const FloatingSOS = () => {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSOS = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    setSending(true);
    try {
      let location = null;
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        ).catch(() => null);
        if (pos) location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
      }
      const { data, error } = await supabase.functions.invoke("send-sos", {
        body: { userId: user.id, message: "Manual SOS triggered", riskLevel: 10, location, sourceCharacter: "Manual SOS" },
      });
      if (error) throw error;
      toast.success(`🚨 SOS sent! ${data?.contactsNotified || 0} contacts notified.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to send SOS");
    } finally {
      setSending(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, hsl(0 100% 55%), hsl(0 100% 40%))",
          boxShadow: "0 0 20px hsl(0 100% 55% / 0.5), 0 0 40px hsl(0 100% 55% / 0.3)",
          animation: "emergency-pulse 2s ease-in-out infinite",
        }}
      >
        <AlertTriangle className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !sending && setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="glass-card p-6 max-w-sm w-full text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: "hsl(var(--neon-red) / 0.2)", border: "2px solid hsl(var(--neon-red))" }}>
                <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
              </div>
              <h3 className="heading-cyber text-xl text-foreground">Emergency SOS</h3>
              <p className="text-muted-foreground text-sm">This will send your location and an emergency alert to all your trusted contacts.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={sending}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSOS}
                  disabled={sending}
                  className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, hsl(0 100% 55%), hsl(0 100% 40%))" }}
                >
                  {sending ? "Sending..." : "🚨 SEND SOS"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingSOS;
