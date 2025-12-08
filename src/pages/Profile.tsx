import { motion } from "framer-motion";
import { Settings, Users, Star, Heart, Edit, Camera } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import character1 from "@/assets/character-1.jpg";
import character2 from "@/assets/character-2.jpg";
import character3 from "@/assets/character-3.jpg";
import character4 from "@/assets/character-4.jpg";

const followedCharacters = [
  { id: "1", name: "Shadow Lord", image: character2 },
  { id: "2", name: "Jae-Min", image: character3 },
  { id: "3", name: "Celestia", image: character4 },
  { id: "4", name: "Nova", image: character1 },
];

const Profile = () => {
  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-neon-cyan via-neon-pink to-neon-purple p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-background">
              <img
                src={character1}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-neon-cyan flex items-center justify-center text-background hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <h1 className="heading-cyber text-2xl text-foreground mb-1">CyberDreamer</h1>
        <p className="text-muted-foreground text-sm mb-4">@cyberdreamer_ai</p>
        <p className="text-muted-foreground max-w-md mx-auto">
          Digital artist & AI companion creator. Living in the neon glow of endless possibilities. ✨
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-neon-outline mt-4 inline-flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-10 max-w-md mx-auto"
      >
        <div className="glass-card p-4 text-center">
          <Users className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">2.4K</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Star className="w-5 h-5 text-neon-orange mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">3</p>
          <p className="text-xs text-muted-foreground">Created</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Heart className="w-5 h-5 text-neon-pink mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">156</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
      </motion.div>

      {/* Following Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <h2 className="category-title mb-4">Characters You Follow</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {followedCharacters.map((char, index) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex-shrink-0 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-pink/50 to-neon-purple/50 p-0.5 mb-2">
                <img
                  src={char.image}
                  alt={char.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <p className="text-sm text-foreground truncate w-20">{char.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Settings Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto"
      >
        <h2 className="category-title mb-4">Settings</h2>
        <div className="space-y-2">
          {[
            { label: "Account Settings", icon: Settings },
            { label: "Privacy & Safety", icon: Users },
            { label: "Notification Preferences", icon: Heart },
          ].map((item, index) => (
            <motion.button
              key={item.label}
              whileHover={{ x: 4 }}
              className="w-full glass-card p-4 flex items-center gap-3 text-left hover:border-neon-cyan/30 transition-colors"
            >
              <item.icon className="w-5 h-5 text-neon-cyan" />
              <span className="text-foreground">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      <BottomNav />
    </div>
  );
};

export default Profile;
