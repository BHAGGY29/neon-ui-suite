import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Wand2, Save, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import FloatingSOS from "@/components/FloatingSOS";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const personalityTags = ["Friendly", "Mysterious", "Playful", "Serious", "Romantic", "Adventurous", "Intellectual", "Caring", "Rebellious", "Calm", "Energetic", "Sarcastic"];
const voiceTypes = [
  { id: "soft", label: "Soft & Gentle" },
  { id: "energetic", label: "Energetic & Bubbly" },
  { id: "deep", label: "Deep & Mysterious" },
  { id: "confident", label: "Confident & Bold" },
  { id: "calm", label: "Calm & Soothing" },
];
const categoryTags = ["Anime", "Realistic", "Idol", "Villain", "Hero", "Fantasy", "Sci-Fi", "Romance", "Comedy", "Drama", "Original"];

const CreateCharacter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", gender: "", personality: [] as string[], voice: "", story: "", categories: [] as string[], isPublic: true,
  });

  const togglePersonality = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      personality: prev.personality.includes(tag) ? prev.personality.filter((t) => t !== tag) : [...prev.personality, tag],
    }));
  };

  const toggleCategory = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(tag) ? prev.categories.filter((t) => t !== tag) : [...prev.categories, tag],
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, avatarFile);
    if (error) { console.error("Upload error:", error); return null; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAIGenerate = async () => {
    if (!user) { toast.error("Please login"); navigate("/auth"); return; }
    if (!aiPrompt.trim()) { toast.error("Enter a description"); return; }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-character", {
        body: { userId: user.id, prompt: aiPrompt, category: formData.categories[0] || "Original" },
      });
      if (error) throw error;
      if (data?.character) {
        // Upload avatar if one was selected
        if (avatarFile) {
          const avatarUrl = await uploadAvatar();
          if (avatarUrl) {
            await supabase.from("characters").update({ avatar_url: avatarUrl }).eq("id", data.character.id);
          }
        }
        toast.success(`Character "${data.character.name}" created!`);
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = async () => {
    if (!user) { toast.error("Please login"); navigate("/auth"); return; }
    if (!formData.name.trim()) { toast.error("Enter a character name"); return; }
    setIsSaving(true);
    try {
      let avatarUrl: string | null = null;
      if (avatarFile) avatarUrl = await uploadAvatar();

      const { error } = await supabase.from("characters").insert({
        user_id: user.id,
        name: formData.name,
        gender: formData.gender || null,
        personality: formData.personality.join(", ") || null,
        voice_type: formData.voice || null,
        backstory: formData.story || null,
        tags: formData.categories.length > 0 ? formData.categories : ["Original"],
        is_public: formData.isPublic,
        avatar_url: avatarUrl,
      });
      if (error) throw error;
      toast.success("Character created!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wand2 className="w-6 h-6 text-neon-purple animate-pulse" />
          <h1 className="heading-cyber text-3xl text-glow-purple">Create Character</h1>
        </div>
        <p className="text-muted-foreground">Bring your AI companion to life</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto space-y-8">
        {/* AI Generator */}
        <div className="space-y-3 p-4 rounded-xl border border-neon-purple/30 bg-neon-purple/5">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-5 h-5 text-neon-purple" />
            <label className="text-sm font-medium text-foreground">AI Character Generator</label>
          </div>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe your character idea... e.g., 'A mysterious cyberpunk hacker with a soft heart'"
            rows={3} className="input-neon resize-none" />
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleAIGenerate} disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate with AI</>}
          </motion.button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-border flex-1" />
          <span className="px-4 text-muted-foreground text-sm">or create manually</span>
          <div className="border-t border-border flex-1" />
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-2xl border-2 border-dashed border-neon-purple/50 flex flex-col items-center justify-center gap-2 hover:border-neon-purple transition-colors bg-muted/30 overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-neon-purple" />
                <span className="text-sm text-muted-foreground">Upload Avatar</span>
              </>
            )}
          </motion.button>
          {avatarPreview && (
            <button onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} className="text-xs text-destructive mt-2">Remove</button>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Character Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter character name..." className="input-neon" />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Gender</label>
          <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="input-neon">
            <option value="">Select gender...</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-Binary</option>
          </select>
        </div>

        {/* Personality */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Personality Traits</label>
          <div className="flex flex-wrap gap-2">
            {personalityTags.map((tag) => (
              <button key={tag} onClick={() => togglePersonality(tag)} className={`pill-filter ${formData.personality.includes(tag) ? "active" : ""}`}>{tag}</button>
            ))}
          </div>
        </div>

        {/* Voice */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Voice Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {voiceTypes.map((v) => (
              <button key={v.id} onClick={() => setFormData({ ...formData, voice: v.id })}
                className={`p-3 rounded-xl border transition-all ${formData.voice === v.id ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border hover:border-neon-cyan/50"}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Character Story & Memory</label>
          <textarea value={formData.story} onChange={(e) => setFormData({ ...formData, story: e.target.value })}
            placeholder="Describe backstory, personality quirks..." rows={5} className="input-neon resize-none" />
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">AI Tags</label>
          <div className="flex flex-wrap gap-2">
            {categoryTags.map((tag) => (
              <button key={tag} onClick={() => toggleCategory(tag)} className={`pill-filter ${formData.categories.includes(tag) ? "active" : ""}`}>{tag}</button>
            ))}
          </div>
        </div>

        {/* Public/Private */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            {formData.isPublic ? <Eye className="w-5 h-5 text-neon-green" /> : <EyeOff className="w-5 h-5 text-neon-orange" />}
            <div>
              <p className="font-medium text-foreground">{formData.isPublic ? "Public" : "Private"}</p>
              <p className="text-sm text-muted-foreground">{formData.isPublic ? "Anyone can chat" : "Only you"}</p>
            </div>
          </div>
          <button onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            className={`w-14 h-8 rounded-full transition-colors relative ${formData.isPublic ? "bg-neon-green/30" : "bg-muted"}`}>
            <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${formData.isPublic ? "left-7 bg-neon-green" : "left-1 bg-muted-foreground"}`} />
          </button>
        </div>

        {/* Save */}
        <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          onClick={handleManualSave} disabled={isSaving}
          className="w-full btn-neon py-4 text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Sparkles className="w-5 h-5" /> Create Character <Save className="w-5 h-5" /></>}
        </motion.button>
      </motion.div>

      <BottomNav />
      <FloatingSOS />
    </div>
  );
};

export default CreateCharacter;
