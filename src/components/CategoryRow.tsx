import { ChevronRight } from "lucide-react";
import CharacterCard from "./CharacterCard";
import { motion } from "framer-motion";

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  chats: number;
  likes: number;
  rating: number;
}

interface CategoryRowProps {
  title: string;
  characters: Character[];
  variant?: "default" | "holographic";
}

const CategoryRow = ({ title, characters, variant = "default" }: CategoryRowProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="category-title">{title}</h2>
        <motion.button
          whileHover={{ x: 5 }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
        >
          See All
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {characters.map((character, index) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-[220px]"
          >
            <CharacterCard
              {...character}
              variant={variant}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryRow;
