import { Shield } from "lucide-react";
import { motion } from "framer-motion";

interface SafetyShieldProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const SafetyShield = ({ size = "md", onClick }: SafetyShieldProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`safety-shield ${sizeClasses[size]} flex-shrink-0`}
      title="Safety Shield - Get Help"
    >
      <Shield className={`${iconSizes[size]} text-neon-red`} />
    </motion.button>
  );
};

export default SafetyShield;
