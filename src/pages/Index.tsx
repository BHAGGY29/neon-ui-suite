import { motion } from "framer-motion";
import { Sparkles, Zap, TrendingUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CategoryRow from "@/components/CategoryRow";
import heroBg from "@/assets/hero-bg.jpg";
import character1 from "@/assets/character-1.jpg";
import character2 from "@/assets/character-2.jpg";
import character3 from "@/assets/character-3.jpg";
import character4 from "@/assets/character-4.jpg";
import character5 from "@/assets/character-5.jpg";
import character6 from "@/assets/character-6.jpg";

const trendingCharacters = [
  { id: "1", name: "Nova", description: "Cyberpunk hacker with secrets to share", image: character1, category: "Originals", chats: 125000, likes: 45000, rating: 4.9 },
  { id: "2", name: "Shadow Lord", description: "Mysterious villain from the dark realm", image: character2, category: "Anime", chats: 98000, likes: 32000, rating: 4.7 },
  { id: "3", name: "Jae-Min", description: "Rising K-Pop star with dreams of glory", image: character3, category: "K-Pop", chats: 156000, likes: 67000, rating: 4.8 },
  { id: "4", name: "Celestia", description: "Magical girl guardian of the cosmos", image: character4, category: "Anime", chats: 87000, likes: 41000, rating: 4.9 },
  { id: "5", name: "Unit-X7", description: "Advanced AI companion with emotions", image: character5, category: "Originals", chats: 72000, likes: 28000, rating: 4.6 },
  { id: "6", name: "Ronin Blaze", description: "Legendary samurai seeking redemption", image: character6, category: "Anime", chats: 110000, likes: 52000, rating: 4.8 },
];

const animeCharacters = [
  { id: "7", name: "Sakura", description: "Cherry blossom ninja princess", image: character4, category: "Anime", chats: 65000, likes: 29000, rating: 4.7 },
  { id: "8", name: "Akira", description: "Time-traveling hero from 3000 AD", image: character2, category: "Anime", chats: 48000, likes: 19000, rating: 4.5 },
  { id: "9", name: "Yuki", description: "Ice queen with a frozen heart", image: character1, category: "Anime", chats: 82000, likes: 37000, rating: 4.8 },
  { id: "10", name: "Hiro", description: "Mecha pilot defending Earth", image: character5, category: "Anime", chats: 91000, likes: 42000, rating: 4.6 },
];

const kpopCharacters = [
  { id: "11", name: "Min-Ji", description: "Debut solo artist with powerful vocals", image: character3, category: "K-Pop", chats: 134000, likes: 78000, rating: 4.9 },
  { id: "12", name: "Hyun", description: "Dance prodigy and group leader", image: character1, category: "K-Pop", chats: 156000, likes: 89000, rating: 4.8 },
  { id: "13", name: "Soo-Yeon", description: "Trainee chasing stardom dreams", image: character4, category: "K-Pop", chats: 67000, likes: 31000, rating: 4.7 },
];

const originalCharacters = [
  { id: "14", name: "Cipher", description: "Digital entity escaping the matrix", image: character5, category: "Originals", chats: 45000, likes: 18000, rating: 4.5 },
  { id: "15", name: "Ember", description: "Fire elemental seeking balance", image: character6, category: "Originals", chats: 52000, likes: 24000, rating: 4.6 },
  { id: "16", name: "Luna", description: "Moon goddess with ancient wisdom", image: character4, category: "Originals", chats: 78000, likes: 35000, rating: 4.8 },
];

const Index = () => {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Cyberpunk cityscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-transparent to-neon-pink/10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-2 text-neon-cyan">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium tracking-widest uppercase">Next Gen AI Companions</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <h1 className="heading-cyber text-4xl md:text-6xl lg:text-7xl text-foreground">
              <span className="text-glow-cyan">NEON</span>
              <span className="text-glow-pink"> CHAT</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Chat with anime heroes, K-Pop stars, and original characters. 
              Your AI companions await.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-neon animate-pulse-neon mt-4"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Start Chatting
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-neon-cyan/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-2 bg-neon-cyan rounded-full animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <div className="px-4 md:px-8 space-y-12 mt-8">
        {/* Trending Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-neon-pink" />
            <h2 className="heading-cyber text-2xl text-glow-pink">Trending Now</h2>
          </div>
          <CategoryRow 
            title="" 
            characters={trendingCharacters} 
            variant="holographic" 
          />
        </section>

        {/* Category Rows */}
        <CategoryRow title="Anime" characters={animeCharacters} />
        <CategoryRow title="K-Pop Idols" characters={kpopCharacters} />
        <CategoryRow title="Original Characters" characters={originalCharacters} />
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
