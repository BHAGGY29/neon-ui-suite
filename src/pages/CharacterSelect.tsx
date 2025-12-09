import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import CharacterCard from '@/components/CharacterCard';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Import local character images
import character1 from '@/assets/character-1.jpg';
import character2 from '@/assets/character-2.jpg';
import character3 from '@/assets/character-3.jpg';
import character4 from '@/assets/character-4.jpg';
import character5 from '@/assets/character-5.jpg';
import character6 from '@/assets/character-6.jpg';

interface Character {
  id: string;
  name: string;
  avatar_url: string | null;
  personality: string | null;
  tags: string[] | null;
}

const defaultCharacters: Character[] = [
  { id: 'default-1', name: 'Luna', avatar_url: character1, personality: 'Friendly & Protective', tags: ['Anime', 'Caring'] },
  { id: 'default-2', name: 'Kai', avatar_url: character2, personality: 'Adventurous & Bold', tags: ['Action', 'Hero'] },
  { id: 'default-3', name: 'Sakura', avatar_url: character3, personality: 'Wise & Supportive', tags: ['K-Pop', 'Idol'] },
  { id: 'default-4', name: 'Rex', avatar_url: character4, personality: 'Strong & Loyal', tags: ['Movies', 'Villain'] },
  { id: 'default-5', name: 'Maya', avatar_url: character5, personality: 'Creative & Inspiring', tags: ['Original', 'Artist'] },
  { id: 'default-6', name: 'Mahika', avatar_url: character6, personality: 'Empathetic & Protective Safety AI', tags: ['Safety', 'Guardian'] },
];

const CharacterSelect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>(defaultCharacters);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    const { data, error } = await supabase
      .from('characters')
      .select('id, name, avatar_url, personality, tags')
      .eq('is_public', true)
      .limit(20);

    if (data && data.length > 0) {
      setCharacters([...defaultCharacters, ...data]);
    }
    setLoading(false);
  };

  const handleSelectCharacter = (character: Character) => {
    // Store selected character in session storage
    sessionStorage.setItem('selectedCharacter', JSON.stringify(character));
    navigate('/chat');
  };

  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.personality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-card/80 to-background border-b border-border/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Choose Character</h1>
            <p className="text-muted-foreground text-sm">Select who you want to chat with</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Characters Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-card/30 rounded-2xl animate-pulse" />
          ))
        ) : (
          filteredCharacters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectCharacter(character)}
              className="cursor-pointer"
            >
              <CharacterCard
                name={character.name}
                description={character.personality || 'An AI companion ready to chat'}
                image={character.avatar_url || character1}
                category={character.tags?.[0] || 'Original'}
              />
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CharacterSelect;
