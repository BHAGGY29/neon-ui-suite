import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MapPin, Clock, Shield, X, Check, Navigation, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useRealtimeSOS } from "@/hooks/useRealtimeSOS";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Alerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    alerts,
    currentLocation,
    locationWatching,
    isTriggering,
    startLocationWatch,
    triggerSOS,
    resolveAlert,
  } = useRealtimeSOS();
  const [showSOSModal, setShowSOSModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Start location watching when component mounts
    const cleanup = startLocationWatch();
    return cleanup;
  }, [startLocationWatch]);

  const handleSOSConfirm = async () => {
    await triggerSOS("Manual SOS", "Emergency assistance needed");
    setShowSOSModal(false);
  };

  const getAlertStyles = (riskLevel: number, resolved: boolean) => {
    if (resolved) {
      return "border-muted bg-muted/20";
    }
    if (riskLevel >= 8) {
      return "border-neon-red/50 bg-neon-red/10 animate-pulse";
    }
    if (riskLevel >= 4) {
      return "border-neon-orange/50 bg-neon-orange/10";
    }
    return "border-neon-cyan/50 bg-neon-cyan/10";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="w-6 h-6 text-neon-red animate-pulse" />
          <h1 className="heading-cyber text-3xl text-foreground">
            Safety <span className="text-neon-red">Alerts</span>
          </h1>
        </div>
        <p className="text-muted-foreground">Crisis center and emergency resources</p>
      </motion.div>

      {/* SOS Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto mb-8 text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSOSModal(true)}
          disabled={isTriggering}
          className="btn-emergency text-lg px-12 py-5 disabled:opacity-50"
        >
          {isTriggering ? (
            <Loader2 className="w-6 h-6 inline mr-2 animate-spin" />
          ) : (
            <Phone className="w-6 h-6 inline mr-2" />
          )}
          {isTriggering ? "TRIGGERING..." : "INITIATE SOS CALL"}
        </motion.button>
        <p className="text-xs text-muted-foreground mt-3">
          This will alert your trusted contacts and share your location in real-time
        </p>
      </motion.div>

      {/* Location Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-xl mx-auto mb-8 glass-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-neon-red" />
            <h3 className="font-semibold text-foreground">Your Location</h3>
          </div>
          <div className="flex items-center gap-2">
            {locationWatching ? (
              <span className="flex items-center gap-1 text-xs text-neon-green">
                <Navigation className="w-3 h-3 animate-pulse" />
                Live Tracking
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Waiting for location...</span>
            )}
          </div>
        </div>
        <div className="aspect-video bg-muted/50 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-red/5 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            {currentLocation ? (
              <div className="text-center">
                <div className="w-4 h-4 bg-neon-red rounded-full mx-auto mb-2 animate-ping" />
                <p className="text-sm text-foreground font-mono">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accuracy: ±{Math.round(currentLocation.accuracy)}m
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Getting location...</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-2 left-2 right-2 glass rounded-lg p-2 text-xs text-muted-foreground">
            📍 Real-time location will be shared with trusted contacts during SOS
          </div>
        </div>
      </motion.div>

      {/* Realtime Alerts List */}
      <div className="max-w-xl mx-auto space-y-4">
        <h2 className="category-title flex items-center gap-2">
          Recent Alerts
          {alerts.filter(a => !a.resolved).length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-neon-red/20 text-neon-red animate-pulse">
              {alerts.filter(a => !a.resolved).length} Active
            </span>
          )}
        </h2>
        
        <AnimatePresence mode="popLayout">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border p-4 ${getAlertStyles(alert.risk_level, alert.resolved)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  alert.resolved ? "bg-neon-green/20" : "bg-neon-red/20"
                }`}>
                  {alert.resolved ? (
                    <Check className="w-6 h-6 text-neon-green" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-neon-red animate-pulse" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {alert.source_character || "SOS Alert"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        alert.resolved 
                          ? "bg-neon-green/20 text-neon-green" 
                          : "bg-neon-red/20 text-neon-red"
                      }`}>
                        {alert.resolved ? "Resolved" : `Risk: ${alert.risk_level}`}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(alert.created_at)}
                    </span>
                  </div>

                  {alert.latitude && alert.longitude && (
                    <p className="text-xs text-muted-foreground font-mono mb-2">
                      📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </p>
                  )}

                  {!alert.resolved && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg text-sm bg-neon-green/20 text-neon-green hover:bg-neon-green/30 transition-colors"
                      >
                        Mark Resolved
                      </button>
                      {alert.latitude && alert.longitude && (
                        <a
                          href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                          View on Map
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Shield className="w-16 h-16 text-neon-green/50 mx-auto mb-4" />
            <p className="text-neon-green">All clear! No active alerts.</p>
          </motion.div>
        )}
      </div>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-8 max-w-md w-full text-center relative"
            >
              <button
                onClick={() => setShowSOSModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <AlertTriangle className="w-16 h-16 text-neon-red mx-auto mb-4 animate-pulse" />
              <h2 className="heading-cyber text-2xl text-neon-red mb-2">Confirm SOS</h2>
              <p className="text-muted-foreground mb-4">
                This will immediately notify your trusted contacts and share your real-time location.
              </p>

              {currentLocation && (
                <div className="glass-card p-3 mb-4 text-left">
                  <p className="text-xs text-muted-foreground mb-1">Your current location:</p>
                  <p className="text-sm font-mono text-foreground">
                    📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleSOSConfirm}
                  disabled={isTriggering}
                  className="w-full btn-emergency py-4 disabled:opacity-50"
                >
                  {isTriggering ? (
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                  ) : (
                    <Phone className="w-5 h-5 inline mr-2" />
                  )}
                  {isTriggering ? "SENDING..." : "CONFIRM SOS CALL"}
                </button>
                <button
                  onClick={() => setShowSOSModal(false)}
                  className="w-full py-3 rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                If you're in immediate danger, please also call your local emergency services.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Alerts;
