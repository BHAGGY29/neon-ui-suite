import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CharacterCard from "@/components/CharacterCard";
import { supabase } from "@/integrations/supabase/client";
import character1 from "@/assets/character-1.jpg";
import character2 from "@/assets/character-2.jpg";
import character3 from "@/assets/character-3.jpg";
import character4 from "@/assets/character-4.jpg";
import character5 from "@/assets/character-5.jpg";
import character6 from "@/assets/character-6.jpg";

const filters = [
  { id: "all", label: "All" },
  { id: "anime", label: "Anime" },
  { id: "movies", label: "Movies" },
  { id: "series", label: "Series" },
  { id: "kpop", label: "K-Pop" },
  { id: "originals", label: "Originals" },
  { id: "villain", label: "Villains" },
  { id: "hero", label: "Heroes" },
];

const defaultCharacters = [
  { id: "1", name: "Nova", description: "Cyberpunk hacker with secrets", image: character1, category: "Originals", chats: 125000, likes: 45000, rating: 4.9 },
  { id: "2", name: "Shadow Lord", description: "Mysterious dark realm villain", image: character2, category: "Anime", chats: 98000, likes: 32000, rating: 4.7 },
  { id: "3", name: "Jae-Min", description: "Rising K-Pop superstar", image: character3, category: "K-Pop", chats: 156000, likes: 67000, rating: 4.8 },
  { id: "4", name: "Celestia", description: "Magical cosmic guardian", image: character4, category: "Anime", chats: 87000, likes: 41000, rating: 4.9 },
  { id: "5", name: "Unit-X7", description: "Emotional AI companion", image: character5, category: "Originals", chats: 72000, likes: 28000, rating: 4.6 },
  { id: "6", name: "Ronin Blaze", description: "Legendary samurai warrior", image: character6, category: "Anime", chats: 110000, likes: 52000, rating: 4.8 },
];

interface DbCharacter {
  id: string;
  name: string;
  avatar_url: string | null;
  personality: string | null;
  tags: string[] | null;
  chat_count: number | null;
  likes: number | null;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [dbCharacters, setDbCharacters] = useState<DbCharacter[]>([]);

  useEffect(() => {
    const fetchChars = async () => {
      const { data } = await supabase.from('characters').select('id, name, avatar_url, personality, tags, chat_count, likes').eq('is_public', true).limit(50);
      if (data) setDbCharacters(data);
    };
    fetchChars();
  }, []);

  const allCharacters = [
    ...defaultCharacters,
    ...dbCharacters.map(c => ({
      id: c.id,
      name: c.name,
      description: c.personality || "AI companion",
      image: c.avatar_url || character1,
      category: c.tags?.[0] || "Original",
      chats: c.chat_count || 0,
      likes: c.likes || 0,
      rating: 4.5,
    })),
  ];

  const filteredCharacters = allCharacters.filter((char) => {
    const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || char.category.toLowerCase() === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse" />
          <h1 className="heading-cyber text-3xl text-glow-cyan">Explore</h1>
          <Sparkles className="w-5 h-5 text-neon-pink animate-pulse" />
        </div>
        <p className="text-muted-foreground">Discover your perfect AI companion</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-2xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search characters, categories, traits..." className="input-neon pl-12 pr-4 py-4 text-lg" />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-2 mb-10">
        {filters.map((filter) => (
          <button key={filter.id} onClick={() => setActiveFilter(filter.id)}
            className={`pill-filter ${activeFilter === filter.id ? "active" : ""}`}>
            {filter.label}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {filteredCharacters.map((character, index) => (
          <motion.div key={character.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <CharacterCard {...character} personality={character.description} variant="holographic" />
          </motion.div>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-muted-foreground text-lg">No characters found. Try a different search.</p>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default Explore;
