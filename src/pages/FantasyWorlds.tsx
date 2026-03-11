import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowLeft, Send, Loader2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FloatingSOS from "@/components/FloatingSOS";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const worlds = [
  { id: "avengers", name: "Avengers Universe", emoji: "🦸‍♂️", color: "from-neon-blue/20 to-neon-red/20", border: "border-neon-blue/30", desc: "Join Earth's Mightiest Heroes and fight Thanos" },
  { id: "action-movie", name: "Action Movie Scene", emoji: "🎬", color: "from-neon-orange/20 to-neon-red/20", border: "border-neon-orange/30", desc: "High-speed chases, explosions, and epic showdowns" },
  { id: "scifi", name: "Science Fiction", emoji: "🛸", color: "from-neon-cyan/20 to-neon-blue/20", border: "border-neon-cyan/30", desc: "Explore alien worlds, warp drives, and future tech" },
  { id: "magic", name: "Magic World", emoji: "🧙‍♂️", color: "from-neon-purple/20 to-neon-pink/20", border: "border-neon-purple/30", desc: "Cast spells, brew potions, battle dark wizards" },
  { id: "fairy-tales", name: "Fairy Tales", emoji: "🧚", color: "from-neon-pink/20 to-neon-purple/20", border: "border-neon-pink/30", desc: "Enchanted forests, magical creatures, and happy endings" },
  { id: "urban-life", name: "Urban Life", emoji: "🏙️", color: "from-neon-green/20 to-neon-cyan/20", border: "border-neon-green/30", desc: "Navigate city life, drama, relationships, and ambition" },
  { id: "cyberpunk", name: "Cyberpunk 2099", emoji: "🤖", color: "from-neon-cyan/20 to-neon-purple/20", border: "border-neon-cyan/30", desc: "Neon-lit streets, hacking corps, cyborg enhancements" },
  { id: "superhero", name: "Superhero World", emoji: "⚡", color: "from-neon-orange/20 to-neon-blue/20", border: "border-neon-orange/30", desc: "Discover your powers and protect the innocent" },
  { id: "pirate", name: "Pirate Adventure", emoji: "🏴‍☠️", color: "from-neon-orange/20 to-neon-red/20", border: "border-neon-orange/30", desc: "Sail the seas searching for legendary treasure" },
  { id: "ninja", name: "Ninja Village", emoji: "🥷", color: "from-neon-purple/20 to-neon-pink/20", border: "border-neon-purple/30", desc: "Train in ancient arts and protect your clan" },
  { id: "space", name: "Space Galaxy", emoji: "🚀", color: "from-neon-blue/20 to-neon-cyan/20", border: "border-neon-blue/30", desc: "Command a starship across the galaxy" },
  { id: "zombie", name: "Zombie Survival", emoji: "🧟", color: "from-neon-green/20 to-neon-orange/20", border: "border-neon-green/30", desc: "Survive the apocalypse and find other survivors" },
];

interface StoryMessage {
  id: string;
  role: "narrator" | "user";
  content: string;
}

const FantasyWorlds = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeWorld, setActiveWorld] = useState<typeof worlds[0] | null>(null);
  const [storyMessages, setStoryMessages] = useState<StoryMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customWorld, setCustomWorld] = useState({ name: "", desc: "", emoji: "🌍" });

  const filtered = worlds.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.desc.toLowerCase().includes(search.toLowerCase())
  );

  const enterWorld = async (world: typeof worlds[0]) => {
    setActiveWorld(world);
    setStoryMessages([]);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          message: `Start a new interactive story in the ${world.name}. ${world.desc}. Set the scene dramatically and vividly. End with 2-3 clear choices for me as the player. Make it immersive and exciting.`,
          characterName: "Narrator",
          characterPersonality: `Epic fantasy narrator for ${world.name}. You are an immersive storyteller creating a ${world.desc} experience. Describe scenes vividly with rich sensory details. Always end with 2-3 clear action choices for the player. Keep responses 4-6 sentences. Never break character.`,
          conversationHistory: [],
        },
      });
      if (error) throw error;
      setStoryMessages([{ id: "1", role: "narrator", content: data.botReply }]);
    } catch (e) {
      toast.error("Failed to start story");
    } finally {
      setLoading(false);
    }
  };

  const sendAction = async () => {
    if (!input.trim() || loading) return;
    const userMsg: StoryMessage = { id: Date.now().toString(), role: "user", content: input };
    setStoryMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = storyMessages.map((m) => ({
        role: m.role === "narrator" ? "assistant" : "user",
        content: m.content,
      }));
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          message: input,
          characterName: "Narrator",
          characterPersonality: `Epic fantasy narrator for ${activeWorld!.name}. Continue the interactive story based on the player's action. Be dramatic and vivid with rich sensory details. Show consequences of their choices. Always end with 2-3 new choices or a question. Keep responses 4-6 sentences.`,
          conversationHistory: history.slice(-10),
        },
      });
      if (error) throw error;
      setStoryMessages((p) => [
        ...p,
        { id: (Date.now() + 1).toString(), role: "narrator", content: data.botReply },
      ]);
    } catch (e) {
      toast.error("Story error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomWorld = () => {
    if (!customWorld.name.trim() || !customWorld.desc.trim()) {
      toast.error("Fill in both name and description");
      return;
    }
    const newWorld = {
      id: `custom-${Date.now()}`,
      name: customWorld.name,
      emoji: customWorld.emoji,
      color: "from-neon-cyan/20 to-neon-pink/20",
      border: "border-neon-cyan/30",
      desc: customWorld.desc,
    };
    setShowCreateForm(false);
    setCustomWorld({ name: "", desc: "", emoji: "🌍" });
    enterWorld(newWorld);
  };

  // Story Mode View
  if (activeWorld) {
    return (
      <div className="h-screen flex flex-col">
        <div className="glass px-4 py-3 flex items-center gap-3 border-b border-border">
          <button onClick={() => setActiveWorld(null)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl">{activeWorld.emoji}</span>
          <div>
            <h3 className="font-semibold text-foreground">{activeWorld.name}</h3>
            <span className="text-xs text-neon-green">● Story Mode Active</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {storyMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.role === "narrator" ? "bubble-ai" : "bubble-user ml-auto max-w-[80%]"}
            >
              <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
            </motion.div>
          ))}
          {loading && (
            <div className="bubble-ai">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        <div className="glass p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAction()}
              placeholder="What do you do next?"
              className="input-neon flex-1"
              disabled={loading}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={sendAction}
              disabled={loading}
              className="btn-neon px-4 py-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
        <FloatingSOS />
      </div>
    );
  }

  // World Selection View
  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="heading-cyber text-3xl text-glow-purple mb-2">Fantasy Worlds</h1>
        <p className="text-muted-foreground">Enter a multiverse of interactive stories</p>
      </motion.div>

      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search worlds..."
          className="input-neon pl-12"
        />
      </div>

      {/* Create Your Own Fantasy */}
      <div className="max-w-4xl mx-auto mb-6">
        {!showCreateForm ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-neon-purple/50 flex items-center justify-center gap-3 text-neon-purple hover:border-neon-purple hover:bg-neon-purple/10 transition-all"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">Create Your Own Fantasy World</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="glass-card p-6 space-y-4"
          >
            <h3 className="heading-cyber text-lg text-neon-purple flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Design Your World
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">World Name</label>
                <input
                  type="text"
                  value={customWorld.name}
                  onChange={(e) => setCustomWorld({ ...customWorld, name: e.target.value })}
                  placeholder="e.g. Dragon Realm"
                  className="input-neon"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Emoji Icon</label>
                <input
                  type="text"
                  value={customWorld.emoji}
                  onChange={(e) => setCustomWorld({ ...customWorld, emoji: e.target.value })}
                  placeholder="🌍"
                  className="input-neon"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">World Description</label>
              <textarea
                value={customWorld.desc}
                onChange={(e) => setCustomWorld({ ...customWorld, desc: e.target.value })}
                placeholder="Describe your fantasy world in detail... What's the setting? What makes it unique?"
                rows={3}
                className="input-neon resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateCustomWorld}
                className="flex-1 btn-neon py-3 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" /> Enter World
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {filtered.map((world, i) => (
          <motion.div
            key={world.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => enterWorld(world)}
            className={`cursor-pointer rounded-2xl p-6 border bg-gradient-to-br ${world.color} ${world.border} transition-all hover:shadow-lg`}
          >
            <div className="text-5xl mb-3">{world.emoji}</div>
            <h3 className="font-cyber text-lg font-bold text-foreground mb-1">{world.name}</h3>
            <p className="text-sm text-muted-foreground">{world.desc}</p>
          </motion.div>
        ))}
      </div>

      <BottomNav />
      <FloatingSOS />
    </div>
  );
};

export default FantasyWorlds;
