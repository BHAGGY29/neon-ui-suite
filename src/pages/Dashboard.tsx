import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, MessageCircle, Heart, Eye, EyeOff, Edit, Trash2, LogOut, Loader2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FloatingSOS from "@/components/FloatingSOS";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Character {
  id: string;
  name: string;
  avatar_url: string | null;
  is_public: boolean | null;
  chat_count: number | null;
  likes: number | null;
  created_at: string;
}

const Dashboard = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchCharacters();
    // Realtime subscription
    const channel = supabase.channel("my-characters").on("postgres_changes", { event: "*", schema: "public", table: "characters", filter: `user_id=eq.${user.id}` }, () => fetchCharacters()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchCharacters = async () => {
    if (!user) return;
    const { data } = await supabase.from("characters").select("id, name, avatar_url, is_public, chat_count, likes, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setCharacters(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out" });
    navigate("/");
  };

  const toggleVisibility = async (id: string, current: boolean | null) => {
    await supabase.from("characters").update({ is_public: !current }).eq("id", id);
    setCharacters((p) => p.map((c) => c.id === id ? { ...c, is_public: !current } : c));
  };

  const deleteCharacter = async (id: string) => {
    if (!confirm("Delete this character?")) return;
    await supabase.from("characters").delete().eq("id", id);
    setCharacters((p) => p.filter((c) => c.id !== id));
    toast({ title: "Character deleted" });
  };

  const fmt = (n: number | null) => {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  const totalChats = characters.reduce((a, c) => a + (c.chat_count || 0), 0);
  const totalLikes = characters.reduce((a, c) => a + (c.likes || 0), 0);

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-neon-orange animate-glow-pulse" />
            <h1 className="heading-cyber text-2xl text-foreground"><span className="text-glow-cyan">Creator</span> Dashboard</h1>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors text-sm">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
        {user && <p className="text-xs text-muted-foreground text-center">Logged in as: {user.email}</p>}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8 max-w-2xl mx-auto">
        <div className="glass-card p-4 text-center">
          <MessageCircle className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{fmt(totalChats)}</p>
          <p className="text-xs text-muted-foreground">Chats</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Heart className="w-5 h-5 text-neon-pink mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{fmt(totalLikes)}</p>
          <p className="text-xs text-muted-foreground">Likes</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Eye className="w-5 h-5 text-neon-green mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{characters.length}</p>
          <p className="text-xs text-muted-foreground">Characters</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-neon-cyan animate-spin" /></div>
      ) : characters.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-4">You haven't created any characters yet.</p>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate("/create")} className="btn-neon inline-flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Create Your First Character
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid gap-4 max-w-4xl mx-auto">
          {characters.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card-neon flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-border bg-muted flex-shrink-0">
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">{c.name[0]}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-cyber text-lg font-bold text-foreground truncate">{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${c.is_public ? "bg-neon-green/20 text-neon-green" : "bg-neon-orange/20 text-neon-orange"}`}>
                    {c.is_public ? "Public" : "Private"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-neon-cyan" />{fmt(c.chat_count)}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-neon-pink" />{fmt(c.likes)}</span>
                  <span className="text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleVisibility(c.id, c.is_public)} className={`p-2 rounded-lg transition-colors ${c.is_public ? "hover:bg-neon-green/20 text-neon-green" : "hover:bg-neon-orange/20 text-neon-orange"}`}>
                  {c.is_public ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button onClick={() => deleteCharacter(c.id)} className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"><Trash2 className="w-5 h-5" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BottomNav />
      <FloatingSOS />
    </div>
  );
};

export default Dashboard;
