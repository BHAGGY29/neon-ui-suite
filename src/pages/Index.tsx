import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, MessageCircle, Search, Sparkles, MapPin, Activity, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FloatingSOS from "@/components/FloatingSOS";
import CategoryRow from "@/components/CategoryRow";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import character1 from "@/assets/character-1.jpg";
import character2 from "@/assets/character-2.jpg";
import character3 from "@/assets/character-3.jpg";
import character4 from "@/assets/character-4.jpg";
import character5 from "@/assets/character-5.jpg";
import character6 from "@/assets/character-6.jpg";

const trendingCharacters = [
  { id: "1", name: "Nova", description: "Cyberpunk hacker with secrets", image: character1, category: "Originals", chats: 125000, likes: 45000, rating: 4.9 },
  { id: "2", name: "Shadow Lord", description: "Mysterious dark realm villain", image: character2, category: "Anime", chats: 98000, likes: 32000, rating: 4.7 },
  { id: "3", name: "Jae-Min", description: "Rising K-Pop superstar", image: character3, category: "K-Pop", chats: 156000, likes: 67000, rating: 4.8 },
  { id: "4", name: "Celestia", description: "Magical cosmic guardian", image: character4, category: "Anime", chats: 87000, likes: 41000, rating: 4.9 },
  { id: "5", name: "Unit-X7", description: "Emotional AI companion", image: character5, category: "Originals", chats: 72000, likes: 28000, rating: 4.6 },
  { id: "6", name: "Ronin Blaze", description: "Legendary samurai warrior", image: character6, category: "Anime", chats: 110000, likes: 52000, rating: 4.8 },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good evening");
  const [username, setUsername] = useState("Explorer");
  const [recentChats, setRecentChats] = useState<any[]>([]);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("username").eq("user_id", user.id).single();
      if (data?.username) setUsername(data.username);
    };
    const fetchRecent = async () => {
      const { data } = await supabase.from("conversations").select("id, character_id, updated_at, characters(name, avatar_url, personality)").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(5);
      if (data) setRecentChats(data);
    };
    fetchProfile();
    fetchRecent();
  }, [user]);

  const actionCards = [
    { icon: MessageCircle, label: "Chat with AI", desc: "Talk to your companions", color: "from-neon-cyan/20 to-neon-blue/20", border: "border-neon-cyan/30", path: "/characters" },
    { icon: Search, label: "Explore Characters", desc: "Discover new AI friends", color: "from-neon-pink/20 to-neon-purple/20", border: "border-neon-pink/30", path: "/explore" },
    { icon: Sparkles, label: "Fantasy Worlds", desc: "Enter interactive stories", color: "from-neon-purple/20 to-neon-blue/20", border: "border-neon-purple/30", path: "/fantasy" },
    { icon: Shield, label: "Emergency Protection", desc: "Safety & trusted contacts", color: "from-neon-red/20 to-neon-orange/20", border: "border-neon-red/30", path: "/contacts" },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* AI Greeting */}
      <div className="px-4 md:px-8 pt-8 pb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="heading-cyber text-xl text-foreground">
                {greeting}, <span className="text-glow-cyan">{username}</span>
              </h1>
              <p className="text-sm text-muted-foreground">Everything looks safe. ✨</p>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--neon-green) / 0.1)", border: "1px solid hsl(var(--neon-green) / 0.3)" }}>
              <Shield className="w-5 h-5 text-neon-green mx-auto mb-1" />
              <p className="text-xs text-neon-green font-medium">Safe</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--neon-cyan) / 0.1)", border: "1px solid hsl(var(--neon-cyan) / 0.3)" }}>
              <MapPin className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
              <p className="text-xs text-neon-cyan font-medium">Location On</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--neon-purple) / 0.1)", border: "1px solid hsl(var(--neon-purple) / 0.3)" }}>
              <Activity className="w-5 h-5 text-neon-purple mx-auto mb-1" />
              <p className="text-xs text-neon-purple font-medium">Protected</p>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {actionCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(card.path)}
              className={`cursor-pointer rounded-2xl p-4 border bg-gradient-to-br ${card.color} ${card.border} transition-all`}>
              <card.icon className="w-7 h-7 text-foreground mb-2" />
              <h3 className="font-semibold text-foreground text-sm">{card.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        {recentChats.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="heading-cyber text-lg text-foreground">Recent Chats</h2>
              <button onClick={() => navigate("/characters")} className="text-neon-cyan text-sm flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {recentChats.map((chat: any) => (
                <motion.div key={chat.id} whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    const c = chat.characters;
                    if (c) {
                      sessionStorage.setItem("selectedCharacter", JSON.stringify({ id: chat.character_id, name: c.name, avatar_url: c.avatar_url, personality: c.personality }));
                      navigate("/chat");
                    }
                  }}
                  className="flex-shrink-0 cursor-pointer text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 p-0.5 mb-1">
                    <img src={chat.characters?.avatar_url || character1} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <p className="text-xs text-foreground truncate w-16">{chat.characters?.name || "AI"}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Trending */}
      <div className="px-4 md:px-8 space-y-8">
        <CategoryRow title="Trending Now" characters={trendingCharacters} variant="holographic" />
      </div>

      <BottomNav />
      <FloatingSOS />
    </div>
  );
};

export default Index;
