import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MapPin, Clock, Shield, X, Check } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import character2 from "@/assets/character-2.jpg";
import character3 from "@/assets/character-3.jpg";

interface Alert {
  id: string;
  type: "distress" | "warning" | "info";
  message: string;
  character: string;
  characterImage: string;
  timestamp: Date;
  resolved: boolean;
}

const initialAlerts: Alert[] = [
  {
    id: "1",
    type: "distress",
    message: "User expressed feelings of loneliness and isolation during conversation.",
    character: "Shadow Lord",
    characterImage: character2,
    timestamp: new Date(Date.now() - 1800000),
    resolved: false,
  },
  {
    id: "2",
    type: "warning",
    message: "Conversation contained sensitive topics. Safety resources were provided.",
    character: "Jae-Min",
    characterImage: character3,
    timestamp: new Date(Date.now() - 7200000),
    resolved: true,
  },
];

const Alerts = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [showSOSModal, setShowSOSModal] = useState(false);

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, resolved: true } : alert))
    );
  };

  const getAlertStyles = (type: string, resolved: boolean) => {
    if (resolved) {
      return "border-muted bg-muted/20";
    }
    switch (type) {
      case "distress":
        return "border-neon-red/50 bg-neon-red/10 animate-pulse";
      case "warning":
        return "border-neon-orange/50 bg-neon-orange/10";
      default:
        return "border-neon-cyan/50 bg-neon-cyan/10";
    }
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
          className="btn-emergency text-lg px-12 py-5"
        >
          <Phone className="w-6 h-6 inline mr-2" />
          INITIATE SOS CALL
        </motion.button>
        <p className="text-xs text-muted-foreground mt-3">
          This will alert your trusted contacts and provide emergency resources
        </p>
      </motion.div>

      {/* Location Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-xl mx-auto mb-8 glass-card p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="w-5 h-5 text-neon-red" />
          <h3 className="font-semibold text-foreground">Your Location</h3>
        </div>
        <div className="aspect-video bg-muted/50 rounded-xl overflow-hidden relative">
          {/* Placeholder Map */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-red/5 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-4 h-4 bg-neon-red rounded-full mx-auto mb-2 animate-ping" />
              <p className="text-sm text-muted-foreground">Location sharing enabled</p>
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 glass rounded-lg p-2 text-xs text-muted-foreground">
            📍 Approximate location will be shared with trusted contacts during SOS
          </div>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="max-w-xl mx-auto space-y-4">
        <h2 className="category-title">Recent Alerts</h2>
        
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl border p-4 ${getAlertStyles(alert.type, alert.resolved)}`}
          >
            <div className="flex items-start gap-3">
              {/* Character Avatar */}
              <img
                src={alert.characterImage}
                alt={alert.character}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-neon-red/30"
              />

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{alert.character}</span>
                    {!alert.resolved && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-neon-red/20 text-neon-red">
                        Active
                      </span>
                    )}
                    {alert.resolved && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-neon-green/20 text-neon-green flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Resolved
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{alert.message}</p>

                {!alert.resolved && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg text-sm bg-neon-green/20 text-neon-green hover:bg-neon-green/30 transition-colors"
                    >
                      Mark Resolved
                    </button>
                    <button className="px-3 py-1.5 rounded-lg text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

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
              className="glass-card p-8 max-w-md w-full text-center"
            >
              <button
                onClick={() => setShowSOSModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <AlertTriangle className="w-16 h-16 text-neon-red mx-auto mb-4 animate-pulse" />
              <h2 className="heading-cyber text-2xl text-neon-red mb-2">Confirm SOS</h2>
              <p className="text-muted-foreground mb-6">
                This will immediately notify your trusted contacts and share your location. Only use in genuine emergencies.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Handle SOS
                    setShowSOSModal(false);
                  }}
                  className="w-full btn-emergency py-4"
                >
                  <Phone className="w-5 h-5 inline mr-2" />
                  CONFIRM SOS CALL
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
