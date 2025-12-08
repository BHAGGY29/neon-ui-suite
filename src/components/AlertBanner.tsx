import { AlertTriangle, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface AlertBannerProps {
  message?: string;
  onDismiss?: () => void;
}

const AlertBanner = ({ 
  message = "If you're in distress, help is available. Click here for safety resources.",
  onDismiss 
}: AlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="alert-banner flex items-center justify-center gap-3"
    >
      <AlertTriangle className="w-5 h-5 animate-pulse" />
      <span className="text-sm">{message}</span>
      <button
        onClick={handleDismiss}
        className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default AlertBanner;
