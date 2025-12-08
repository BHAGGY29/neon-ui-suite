import { motion } from "framer-motion";
import { MessageCircle, Heart, Star } from "lucide-react";

interface CharacterCardProps {
  name: string;
  description: string;
  image: string;
  category: string;
  chats?: number;
  likes?: number;
  rating?: number;
  variant?: "default" | "holographic" | "compact";
}

const CharacterCard = ({
  name,
  description,
  image,
  category,
  chats = 0,
  likes = 0,
  rating = 0,
  variant = "default",
}: CharacterCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={variant === "holographic" ? "card-holographic cursor-pointer" : "card-neon cursor-pointer"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
          {category}
        </span>
      </div>

      {/* Character Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Holographic Overlay */}
        {variant === "holographic" && (
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-pink/10 mix-blend-overlay" />
        )}
      </div>

      {/* Character Info */}
      <div className="space-y-2">
        <h3 className="font-cyber text-lg font-bold text-foreground truncate">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 text-neon-cyan" />
            <span>{chats.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-neon-pink" />
            <span>{likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-neon-orange" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Chat Now Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-3 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 text-neon-cyan hover:border-neon-cyan hover:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)] transition-all duration-300"
        >
          Chat Now
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CharacterCard;
