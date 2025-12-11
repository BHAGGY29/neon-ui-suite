import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, MessageCircle, Heart, Eye, EyeOff, Edit, Trash2, MoreVertical, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import character1 from "@/assets/character-1.jpg";
import character4 from "@/assets/character-4.jpg";
import character5 from "@/assets/character-5.jpg";

interface CreatedCharacter {
  id: string;
  name: string;
  image: string;
  isPublic: boolean;
  chats: number;
  likes: number;
  saves: number;
  createdAt: string;
}

const myCharacters: CreatedCharacter[] = [
  { id: "1", name: "Nova", image: character1, isPublic: true, chats: 125000, likes: 45000, saves: 12000, createdAt: "Dec 1, 2024" },
  { id: "2", name: "Unit-X7", image: character5, isPublic: true, chats: 72000, likes: 28000, saves: 8500, createdAt: "Nov 28, 2024" },
  { id: "3", name: "Celestia", image: character4, isPublic: false, chats: 340, likes: 0, saves: 0, createdAt: "Nov 15, 2024" },
];

const Dashboard = () => {
  const [characters, setCharacters] = useState(myCharacters);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const toggleVisibility = (id: string) => {
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === id ? { ...char, isPublic: !char.isPublic } : char
      )
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-neon-orange animate-glow-pulse" />
            <h1 className="heading-cyber text-3xl text-foreground">
              <span className="text-glow-cyan">Creator</span> Dashboard
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
        <p className="text-muted-foreground text-center">Manage your AI characters</p>
        {user && (
          <p className="text-xs text-muted-foreground text-center mt-1">
            Logged in as: {user.email}
          </p>
        )}
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto"
      >
        <div className="glass-card p-4 text-center">
          <MessageCircle className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {formatNumber(characters.reduce((acc, c) => acc + c.chats, 0))}
          </p>
          <p className="text-xs text-muted-foreground">Total Chats</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Heart className="w-6 h-6 text-neon-pink mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {formatNumber(characters.reduce((acc, c) => acc + c.likes, 0))}
          </p>
          <p className="text-xs text-muted-foreground">Total Likes</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Eye className="w-6 h-6 text-neon-green mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{characters.length}</p>
          <p className="text-xs text-muted-foreground">Characters</p>
        </div>
      </motion.div>

      {/* Character Cards */}
      <div className="grid gap-4 max-w-4xl mx-auto">
        {characters.map((character, index) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-neon flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4"
          >
            {/* Avatar */}
            <img
              src={character.image}
              alt={character.name}
              className="w-20 h-20 rounded-xl object-cover ring-2 ring-border"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-cyber text-lg font-bold text-foreground truncate">
                  {character.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    character.isPublic
                      ? "bg-neon-green/20 text-neon-green"
                      : "bg-neon-orange/20 text-neon-orange"
                  }`}
                >
                  {character.isPublic ? "Public" : "Private"}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-neon-cyan" />
                  <span>{formatNumber(character.chats)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-neon-pink" />
                  <span>{formatNumber(character.likes)}</span>
                </div>
                <span className="text-xs">Created {character.createdAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Visibility Toggle */}
              <button
                onClick={() => toggleVisibility(character.id)}
                className={`p-2 rounded-lg transition-colors ${
                  character.isPublic
                    ? "hover:bg-neon-green/20 text-neon-green"
                    : "hover:bg-neon-orange/20 text-neon-orange"
                }`}
                title={character.isPublic ? "Make Private" : "Make Public"}
              >
                {character.isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>

              <button
                className="p-2 rounded-lg hover:bg-muted transition-colors text-neon-cyan"
                title="Edit Character"
              >
                <Edit className="w-5 h-5" />
              </button>

              <button
                className="p-2 rounded-lg hover:bg-destructive/20 transition-colors text-destructive"
                title="Delete Character"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {characters.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground text-lg mb-4">You haven't created any characters yet.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="btn-neon"
          >
            Create Your First Character
          </motion.button>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default Dashboard;
