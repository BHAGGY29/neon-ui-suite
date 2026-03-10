import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Users, Star, Heart, Edit, Camera, LogOut, PlusCircle, Shield, MessageCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FloatingSOS from "@/components/FloatingSOS";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import character1 from "@/assets/character-1.jpg";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => { if (data) setProfile(data); });
    supabase.from("characters").select("id", { count: "exact" }).eq("user_id", user.id).then(({ count }) => setCharCount(count || 0));
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Please login to view your profile</p>
        <button onClick={() => navigate("/auth")} className="btn-neon">Login / Sign Up</button>
        <BottomNav />
      </div>
    );
  }

  const menuItems = [
    { label: "My Characters", icon: Star, path: "/dashboard" },
    { label: "Create Character", icon: PlusCircle, path: "/create" },
    { label: "Fantasy Worlds", icon: BookOpen, path: "/fantasy" },
    { label: "Chat History", icon: MessageCircle, path: "/characters" },
    { label: "Safety Settings", icon: Shield, path: "/settings" },
    { label: "Trusted Contacts", icon: Users, path: "/contacts" },
  ];

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-neon-cyan via-neon-pink to-neon-purple p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-background">
              <img src={profile?.avatar_url || character1} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        <h1 className="heading-cyber text-2xl text-foreground mb-1">{profile?.username || user.email?.split("@")[0]}</h1>
        <p className="text-muted-foreground text-sm mb-1">{user.email}</p>
        {profile?.bio && <p className="text-muted-foreground max-w-md mx-auto text-sm">{profile.bio}</p>}
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-8 max-w-md mx-auto">
        <div className="glass-card p-3 text-center">
          <Star className="w-5 h-5 text-neon-orange mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{charCount}</p>
          <p className="text-xs text-muted-foreground">Created</p>
        </div>
        <div className="glass-card p-3 text-center">
          <MessageCircle className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">—</p>
          <p className="text-xs text-muted-foreground">Chats</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Heart className="w-5 h-5 text-neon-pink mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">—</p>
          <p className="text-xs text-muted-foreground">Likes</p>
        </div>
      </motion.div>

      {/* Menu */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-md mx-auto space-y-2 mb-6">
        {menuItems.map((item) => (
          <motion.button key={item.label} whileHover={{ x: 4 }} onClick={() => navigate(item.path)}
            className="w-full glass-card p-4 flex items-center gap-3 text-left hover:border-neon-cyan/30 transition-colors">
            <item.icon className="w-5 h-5 text-neon-cyan" />
            <span className="text-foreground">{item.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Logout */}
      <div className="max-w-md mx-auto">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout}
          className="w-full p-4 rounded-xl flex items-center justify-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
          <LogOut className="w-5 h-5" /> Logout
        </motion.button>
      </div>

      <BottomNav />
      <FloatingSOS />
    </div>
  );
};

export default Profile;
