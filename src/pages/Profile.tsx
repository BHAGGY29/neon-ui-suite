import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Settings, Users, Star, Heart, Edit, Camera, LogOut, PlusCircle, Shield, MessageCircle, BookOpen, Loader2 } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [charCount, setCharCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [profileRes, charsRes, convsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("characters").select("id, likes").eq("user_id", user.id),
        supabase.from("conversations").select("id", { count: "exact" }).eq("user_id", user.id),
      ]);
      if (profileRes.data) {
        setProfile(profileRes.data);
        setEditForm({ username: profileRes.data.username || "", bio: profileRes.data.bio || "" });
      }
      if (charsRes.data) {
        setCharCount(charsRes.data.length);
        setTotalLikes(charsRes.data.reduce((a, c) => a + (c.likes || 0), 0));
      }
      setChatCount(convsRes.count || 0);
    };
    fetchAll();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/profile.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("user_id", user.id);
    setProfile((p: any) => ({ ...p, avatar_url: data.publicUrl }));
    toast.success("Avatar updated!");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      username: editForm.username,
      bio: editForm.bio,
    }).eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else {
      setProfile((p: any) => ({ ...p, ...editForm }));
      toast.success("Profile updated!");
      setEditing(false);
    }
    setSaving(false);
  };

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
    { label: "My Characters", icon: Star, path: "/dashboard", desc: "Manage your creations" },
    { label: "Create Character", icon: PlusCircle, path: "/create", desc: "Build a new AI companion" },
    { label: "Fantasy Worlds", icon: BookOpen, path: "/fantasy", desc: "Enter interactive stories" },
    { label: "Chat History", icon: MessageCircle, path: "/characters", desc: "View past conversations" },
    { label: "Safety Settings", icon: Shield, path: "/settings", desc: "Configure protections" },
    { label: "Trusted Contacts", icon: Users, path: "/contacts", desc: "Emergency contacts" },
  ];

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-neon-cyan via-neon-pink to-neon-purple p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-background">
              <img src={profile?.avatar_url || character1} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-neon-cyan flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Camera className="w-4 h-4 text-background" />
          </button>
        </div>

        {editing ? (
          <div className="space-y-3 max-w-sm mx-auto">
            <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="input-neon text-center" placeholder="Username" />
            <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="input-neon text-center resize-none" rows={2} placeholder="Bio" />
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl border border-border text-muted-foreground">Cancel</button>
              <button onClick={handleSaveProfile} disabled={saving} className="flex-1 btn-neon py-2 flex items-center justify-center gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2">
              <h1 className="heading-cyber text-2xl text-foreground">{profile?.username || user.email?.split("@")[0]}</h1>
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Edit className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-1">{user.email}</p>
            {profile?.bio && <p className="text-muted-foreground max-w-md mx-auto text-sm">{profile.bio}</p>}
          </>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-8 max-w-md mx-auto"
      >
        <div className="glass-card p-3 text-center">
          <Star className="w-5 h-5 text-neon-orange mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{charCount}</p>
          <p className="text-xs text-muted-foreground">Created</p>
        </div>
        <div className="glass-card p-3 text-center">
          <MessageCircle className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{chatCount}</p>
          <p className="text-xs text-muted-foreground">Chats</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Heart className="w-5 h-5 text-neon-pink mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{totalLikes}</p>
          <p className="text-xs text-muted-foreground">Likes</p>
        </div>
      </motion.div>

      {/* Menu */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-md mx-auto space-y-2 mb-6">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => navigate(item.path)}
            className="w-full glass-card p-4 flex items-center gap-3 text-left hover:border-neon-cyan/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-neon-cyan" />
            </div>
            <div className="flex-1">
              <span className="text-foreground font-medium">{item.label}</span>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Logout */}
      <div className="max-w-md mx-auto">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full p-4 rounded-xl flex items-center justify-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Logout
        </motion.button>
      </div>

      <BottomNav />
      <FloatingSOS />
    </div>
  );
};

export default Profile;
